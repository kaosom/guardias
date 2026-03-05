import 'dart:convert';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_dotenv/flutter_dotenv.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:lucide_icons/lucide_icons.dart';
import '../../../core/network/api_client.dart';
import '../../../core/models/vehicle_record.dart';
import '../../../ui/organisms/guard_header.dart';
import '../../../ui/molecules/search_bar.dart';
import '../../../ui/organisms/result_card.dart';
import '../../../ui/molecules/floating_actions_bar.dart';
import '../../../ui/organisms/vehicle_modal.dart';
import '../../../ui/organisms/qr_scanner.dart';
import '../../../ui/organisms/camera_scanner.dart';
import '../../../ui/organisms/ocr_confirmation.dart';
import '../../../core/utils/qr_payload.dart';
import '../../../core/theme/app_theme.dart';

class HomeScreen extends ConsumerStatefulWidget {
  const HomeScreen({super.key});

  @override
  ConsumerState<HomeScreen> createState() => _HomeScreenState();
}

class _HomeScreenState extends ConsumerState<HomeScreen> {
  String _query = '';
  bool _isLoading = false;
  VehicleRecord? _result;
  String? _error;

  void _handleSearch(String q) async {
    setState(() {
      _query = q;
      _isLoading = true;
      _result = null;
      _error = null;
    });

    try {
      final res = await ApiClient.get(
        '/api/vehicles?q=${Uri.encodeComponent(q)}',
      );
      if (res.statusCode == 200) {
        final data = jsonDecode(res.body);
        setState(() {
          _result = VehicleRecord.fromJson(data);
        });
      } else {
        setState(() {
          _error = 'No se encontró ningún registro para "$q".';
        });
      }
    } catch (_) {
      setState(() => _error = 'Error de conexión');
    } finally {
      setState(() => _isLoading = false);
    }
  }

  void _openQrScanner() {
    Navigator.push(
      context,
      MaterialPageRoute(
        builder: (context) => QrScannerScreen(
          onScan: (data) async {
            final messenger = ScaffoldMessenger.of(context);
            final secret = dotenv.env['QR_CRYPTO_SECRET'] ?? '';
            final payload = await parseInstitutionalQr(data, secret: secret);
            if (payload != null) {
              _handleSearch(payload.searchTerm);
            } else {
              messenger.showSnackBar(
                const SnackBar(
                  content: Text('Código QR inválido'),
                  backgroundColor: AppColors.error,
                ),
              );
            }
          },
        ),
      ),
    );
  }

  void _openCameraScanner() {
    Navigator.push(
      context,
      MaterialPageRoute(
        builder: (context) => CameraScannerScreen(
          onCapture: (imagePath) => _showOcrConfirmation(imagePath),
        ),
      ),
    );
  }

  void _showOcrConfirmation(String imagePath) {
    Navigator.push(
      context,
      MaterialPageRoute(
        builder: (context) => OcrConfirmationScreen(
          imagePath: imagePath,
          detectedPlate: 'TNA-75A',
          onConfirm: (plate) => _handleSearch(plate),
          onRetry: _openCameraScanner,
        ),
      ),
    );
  }

  void _openVehicleModal(VehicleModalMode mode) {
    showDialog(
      context: context,
      barrierDismissible: false,
      builder: (context) => VehicleModal(
        mode: mode,
        initialRecord: mode != VehicleModalMode.add ? _result : null,
        onSave: (payload, id) async {
          try {
            if (mode == VehicleModalMode.add) {
              final body = {
                'plate': payload.plate,
                'studentId': payload.studentId,
                'studentName': payload.studentName,
                'vehicleType': payload.vehicleType,
                'hasHelmet': payload.hasHelmet,
                'helmetCount': payload.helmetCount,
                'helmets': payload.helmets,
                'vehicleDescription': payload.vehicleDescription,
                'vehiclePhotoPath': payload.vehiclePhotoPath,
              };
              final res = await ApiClient.post(
                '/api/vehicles',
                body: jsonEncode(body),
              );
              if (res.statusCode == 200 || res.statusCode == 201) {
                _handleSearch(payload.plate);
              }
            } else if (mode == VehicleModalMode.edit && id != null) {
              final body = {
                'plate': payload.plate,
                'studentId': payload.studentId,
                'studentName': payload.studentName,
                'vehicleType': payload.vehicleType,
                'hasHelmet': payload.hasHelmet,
                'helmetCount': payload.helmetCount,
                'helmets': payload.helmets,
                'vehicleDescription': payload.vehicleDescription,
                'vehiclePhotoPath': payload.vehiclePhotoPath,
              };
              final res = await ApiClient.put(
                '/api/vehicles/$id',
                body: jsonEncode(body),
              );
              if (res.statusCode == 200) _handleSearch(payload.plate);
            }
          } catch (_) {}
        },
        onDelete: (id) async {
          try {
            final res = await ApiClient.delete('/api/vehicles/$id');
            if (res.statusCode == 200 || res.statusCode == 204) {
              setState(() {
                _result = null;
                _query = '';
              });
            }
          } catch (_) {}
        },
      ),
    );
  }

  void _toggleStatus() async {
    if (_result == null || _isLoading) return;
    setState(() => _isLoading = true);

    final newAction = _result!.status == 'inside' ? 'exit' : 'entry';
    try {
      final res = await ApiClient.post(
        '/api/movements',
        body: jsonEncode({'vehicleId': _result!.id, 'type': newAction}),
      );
      if (res.statusCode == 201 || res.statusCode == 200) {
        _handleSearch(_result!.plate);
      }
    } catch (_) {
    } finally {
      setState(() => _isLoading = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.slate50,
      body: SafeArea(
        child: Column(
          children: [
            const GuardHeader(),
            Expanded(
              child: Stack(
                children: [
                  SingleChildScrollView(
                    padding: const EdgeInsets.only(
                      left: 20,
                      right: 20,
                      top: 20,
                      bottom: 110,
                    ),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.stretch,
                      children: [
                        SearchBarWidget(
                          onSearch: _handleSearch,
                          isLoading: _isLoading,
                          externalQuery: _query,
                        ),
                        const SizedBox(height: 20),

                        // ── States ─────────────────────────────────────
                        if (_isLoading && _result == null)
                          const Padding(
                            padding: EdgeInsets.all(48),
                            child: Center(child: CircularProgressIndicator()),
                          )
                        else if (_error != null)
                          _ErrorBanner(message: _error!)
                        else if (_result != null) ...[
                          ResultCard(
                            record: _result!,
                            onEditUser: () =>
                                _openVehicleModal(VehicleModalMode.edit),
                            onEditVehicleInHeader: () =>
                                _openVehicleModal(VehicleModalMode.edit),
                            showVehicleEditInHeader: true,
                          ),
                          const SizedBox(height: 16),
                          _AccessToggleButton(
                            isInside: _result!.status == 'inside',
                            isLoading: _isLoading,
                            onPressed: _toggleStatus,
                          ),
                        ] else
                          const _EmptyState(),
                      ],
                    ),
                  ),

                  // ── FAB Bar ───────────────────────────────────────────
                  Positioned(
                    left: 0,
                    right: 0,
                    bottom: 0,
                    child: FloatingActionsBar(
                      onQr: _openQrScanner,
                      onAdd: () => _openVehicleModal(VehicleModalMode.add),
                    ),
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }
}

// ── Sub-widgets ────────────────────────────────────────────────────────────
class _EmptyState extends StatelessWidget {
  const _EmptyState();

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.only(top: 56),
      child: Column(
        children: [
          Container(
            width: 64,
            height: 64,
            decoration: BoxDecoration(
              color: AppColors.slate100,
              borderRadius: AppRadius.xl,
            ),
            child: const Center(
              child: Icon(
                LucideIcons.search,
                size: 26,
                color: AppColors.slate300,
              ),
            ),
          ),
          const SizedBox(height: 16),
          Text(
            'Busca un vehículo',
            style: GoogleFonts.inter(
              fontSize: 16,
              fontWeight: FontWeight.w600,
              color: AppColors.slate700,
            ),
          ),
          const SizedBox(height: 6),
          Text(
            'Ingresa la placa, matrícula o escanea\nun código QR para continuar.',
            style: GoogleFonts.inter(
              fontSize: 13,
              color: AppColors.slate400,
              height: 1.6,
            ),
            textAlign: TextAlign.center,
          ),
        ],
      ),
    );
  }
}

class _ErrorBanner extends StatelessWidget {
  final String message;
  const _ErrorBanner({required this.message});

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 12),
      decoration: BoxDecoration(
        color: AppColors.errorLight,
        borderRadius: AppRadius.lg,
      ),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Icon(LucideIcons.alertCircle, size: 15, color: AppColors.error),
          const SizedBox(width: 10),
          Expanded(
            child: Text(
              message,
              style: GoogleFonts.inter(fontSize: 13, color: AppColors.error),
            ),
          ),
        ],
      ),
    );
  }
}

class _AccessToggleButton extends StatelessWidget {
  final bool isInside;
  final bool isLoading;
  final VoidCallback onPressed;

  const _AccessToggleButton({
    required this.isInside,
    required this.isLoading,
    required this.onPressed,
  });

  @override
  Widget build(BuildContext context) {
    final isEntry = !isInside; // if outside, next action is entry
    final Color bg = isEntry ? AppColors.success : AppColors.slate700;
    final IconData ico = isEntry
        ? LucideIcons.arrowDownToLine
        : LucideIcons.arrowUpFromLine;
    final String label = isEntry ? 'Registrar Entrada' : 'Registrar Salida';

    return SizedBox(
      height: 52,
      child: ElevatedButton(
        style: ElevatedButton.styleFrom(
          backgroundColor: bg,
          foregroundColor: AppColors.white,
          elevation: 0,
          shape: const RoundedRectangleBorder(borderRadius: AppRadius.md),
        ),
        onPressed: isLoading ? null : onPressed,
        child: isLoading
            ? const SizedBox(
                width: 18,
                height: 18,
                child: CircularProgressIndicator(
                  strokeWidth: 2,
                  color: AppColors.white,
                ),
              )
            : Row(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  Icon(ico, size: 16),
                  const SizedBox(width: 8),
                  Text(
                    label,
                    style: GoogleFonts.inter(
                      fontSize: 15,
                      fontWeight: FontWeight.w600,
                    ),
                  ),
                ],
              ),
      ),
    );
  }
}
