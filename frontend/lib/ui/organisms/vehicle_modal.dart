import 'dart:io';
import 'dart:convert';
import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:lucide_icons/lucide_icons.dart';
import 'package:image_picker/image_picker.dart';
import 'package:http/http.dart' as http;
import '../../../core/network/api_client.dart';
import '../../../core/utils/validation.dart';
import '../../core/models/vehicle_record.dart';
import '../../../core/theme/app_theme.dart';

class VehicleModalPayload {
  final String plate;
  final String studentId;
  final String studentName;
  final String vehicleType;
  final bool hasHelmet;
  final int helmetCount;
  final List<Map<String, String>> helmets;
  final String vehicleDescription;
  final String? vehiclePhotoPath;

  VehicleModalPayload({
    required this.plate,
    required this.studentId,
    required this.studentName,
    required this.vehicleType,
    required this.hasHelmet,
    required this.helmetCount,
    required this.helmets,
    required this.vehicleDescription,
    this.vehiclePhotoPath,
  });
}

enum VehicleModalMode { add, edit, delete }

class VehicleModal extends StatefulWidget {
  final VehicleModalMode mode;
  final VehicleRecord? initialRecord;
  final Future<void> Function(VehicleModalPayload, int?)? onSave;
  final Future<void> Function(int)? onDelete;

  const VehicleModal({
    super.key,
    required this.mode,
    this.initialRecord,
    this.onSave,
    this.onDelete,
  });

  @override
  State<VehicleModal> createState() => _VehicleModalState();
}

class _VehicleModalState extends State<VehicleModal> {
  late TextEditingController _plateCtrl;
  late TextEditingController _studentNameCtrl;
  late TextEditingController _studentIdCtrl;
  late TextEditingController _descCtrl;

  String _vehicleType = 'moto';
  bool _hasHelmet = false;
  int _helmetCount = 1;
  List<TextEditingController> _helmetCtrls = [TextEditingController()];

  String? _vehiclePhotoUrl;
  File? _pendingPhotoFile;
  bool _isUploading = false;

  String _plateError = '';
  String _matriculaError = '';

  @override
  void initState() {
    super.initState();
    _plateCtrl = TextEditingController(text: widget.initialRecord?.plate ?? '');
    _studentNameCtrl = TextEditingController(
      text: widget.initialRecord?.studentName ?? '',
    );
    _studentIdCtrl = TextEditingController(
      text: widget.initialRecord?.studentId ?? '',
    );
    _descCtrl = TextEditingController(
      text: widget.initialRecord?.vehicleDescription ?? '',
    );

    if (widget.initialRecord != null && widget.mode != VehicleModalMode.add) {
      _vehicleType = widget.initialRecord!.vehicleType;
      _hasHelmet = widget.initialRecord!.hasHelmet;
      _helmetCount = widget.initialRecord!.helmetCount;
      _vehiclePhotoUrl = widget.initialRecord!.vehiclePhotoUrl;

      final initHelmets = widget.initialRecord!.helmets;
      _helmetCtrls = List.generate(
        _helmetCount > 0 ? _helmetCount : 1,
        (i) => TextEditingController(
          text: initHelmets.length > i
              ? (initHelmets[i]['description'] ?? '')
              : '',
        ),
      );
    }

    _plateCtrl.addListener(_validatePlate);
    _studentIdCtrl.addListener(_validateMatricula);
    _validatePlate();
    _validateMatricula();
  }

  void _validatePlate() {
    final formatted = formatPueblaPlate(_plateCtrl.text);
    if (formatted != _plateCtrl.text && _plateCtrl.text.isNotEmpty) {
      final sel = _plateCtrl.selection;
      _plateCtrl.value = TextEditingValue(text: formatted, selection: sel);
    }
    final res = validatePlateWithMessage(_plateCtrl.text);
    setState(
      () => _plateError = res.isValid ? '' : (res.error ?? 'Error de placa'),
    );
  }

  void _validateMatricula() {
    final formatted = formatMatricula(_studentIdCtrl.text);
    if (formatted != _studentIdCtrl.text && _studentIdCtrl.text.isNotEmpty) {
      final sel = _studentIdCtrl.selection;
      _studentIdCtrl.value = TextEditingValue(text: formatted, selection: sel);
    }
    final res = validateMatriculaWithMessage(_studentIdCtrl.text);
    setState(
      () => _matriculaError = res.isValid
          ? ''
          : (res.error ?? 'Error de matrícula'),
    );
  }

  @override
  void dispose() {
    _plateCtrl.dispose();
    _studentNameCtrl.dispose();
    _studentIdCtrl.dispose();
    _descCtrl.dispose();
    for (var c in _helmetCtrls) {
      c.dispose();
    }
    super.dispose();
  }

  void _updateHelmetCount(int newCount) {
    setState(() {
      _helmetCount = newCount.clamp(1, 4);
      while (_helmetCtrls.length < _helmetCount) {
        _helmetCtrls.push(TextEditingController());
      }
      while (_helmetCtrls.length > _helmetCount) {
        _helmetCtrls.removeLast().dispose();
      }
    });
  }

  Future<void> _pickImage() async {
    final picker = ImagePicker();
    final picked = await picker.pickImage(source: ImageSource.camera);
    if (picked != null) {
      setState(() {
        _pendingPhotoFile = File(picked.path);
        _vehiclePhotoUrl = picked.path;
      });
    }
  }

  bool get _isFormValid {
    if (_plateError.isNotEmpty || _plateCtrl.text.isEmpty) return false;
    if (widget.mode == VehicleModalMode.add) {
      if (_matriculaError.isNotEmpty || _studentIdCtrl.text.isEmpty) {
        return false;
      }
      if (_studentNameCtrl.text.trim().isEmpty) return false;
    }
    return true;
  }

  Future<void> _handleSave() async {
    String? finalPhotoPath;

    if (_vehiclePhotoUrl != null && _pendingPhotoFile == null) {
      finalPhotoPath = _vehiclePhotoUrl;
    }

    if (_pendingPhotoFile != null) {
      setState(() => _isUploading = true);
      try {
        final uri = Uri.parse('${ApiClient.baseUrl}/api/upload');
        final request = http.MultipartRequest('POST', uri);
        request.files.add(
          await http.MultipartFile.fromPath('file', _pendingPhotoFile!.path),
        );
        request.fields['plate'] = _plateCtrl.text;

        final streamed = await http.Client().send(request);
        final response = await http.Response.fromStream(streamed);
        if (response.statusCode == 200 || response.statusCode == 201) {
          final data = jsonDecode(response.body) as Map<String, dynamic>;
          finalPhotoPath = data['path'] as String?;
        }
      } catch (e) {
        debugPrint('Upload error: $e');
      } finally {
        setState(() => _isUploading = false);
      }
    }

    final payload = VehicleModalPayload(
      plate: _plateCtrl.text,
      studentId: _studentIdCtrl.text,
      studentName: _studentNameCtrl.text.trim(),
      vehicleType: _vehicleType,
      hasHelmet: _hasHelmet,
      helmetCount: _hasHelmet ? _helmetCount : 0,
      helmets: _hasHelmet
          ? _helmetCtrls.map((c) => {'description': c.text}).toList()
          : [],
      vehicleDescription: _descCtrl.text,
      vehiclePhotoPath: finalPhotoPath,
    );

    if (widget.onSave != null) {
      await widget.onSave!(payload, widget.initialRecord?.id);
    }
    if (mounted) Navigator.pop(context);
  }

  final _titles = {
    VehicleModalMode.add: 'Registrar estudiante y vehículo',
    VehicleModalMode.edit: 'Editar vehículo',
    VehicleModalMode.delete: 'Eliminar vehículo',
  };

  final _descriptions = {
    VehicleModalMode.add:
        'Captura los datos del alumno y registra uno de sus vehículos.',
    VehicleModalMode.edit: 'Modifica los datos del vehículo seleccionado.',
    VehicleModalMode.delete: 'Esta acción no se puede deshacer.',
  };

  @override
  Widget build(BuildContext context) {
    final mq = MediaQuery.of(context);
    final needsHelmet = _vehicleType == 'moto' || _vehicleType == 'bici';
    final needsVehicleDetails =
        _vehicleType == 'moto' || _vehicleType == 'carro'; // Ampliado

    return Dialog(
      insetPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 24),
      backgroundColor: AppColors.white,
      shape: const RoundedRectangleBorder(borderRadius: AppRadius.xl),
      child: ConstrainedBox(
        constraints: BoxConstraints(
          maxHeight: mq.size.height * 0.9,
          maxWidth: 440,
        ),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            // Header
            Padding(
              padding: const EdgeInsets.fromLTRB(24, 24, 24, 16),
              child: Row(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          _titles[widget.mode]!,
                          style: GoogleFonts.inter(
                            fontSize: 22,
                            fontWeight: FontWeight.w700,
                            color: AppColors.slate900,
                            letterSpacing: -0.5,
                          ),
                        ),
                        const SizedBox(height: 6),
                        Text(
                          _descriptions[widget.mode]!,
                          style: GoogleFonts.inter(
                            fontSize: 14,
                            color: AppColors.slate500,
                            height: 1.4,
                          ),
                        ),
                      ],
                    ),
                  ),
                  const SizedBox(width: 16),
                  GestureDetector(
                    onTap: () => Navigator.pop(context),
                    child: Container(
                      padding: const EdgeInsets.all(8),
                      decoration: const BoxDecoration(
                        color: AppColors.slate100,
                        shape: BoxShape.circle,
                      ),
                      child: const Icon(
                        LucideIcons.x,
                        size: 18,
                        color: AppColors.slate500,
                      ),
                    ),
                  ),
                ],
              ),
            ),

            // Scrollable Content
            Flexible(
              child: SingleChildScrollView(
                physics: const BouncingScrollPhysics(),
                padding: const EdgeInsets.symmetric(horizontal: 24),
                child: widget.mode == VehicleModalMode.delete
                    ? _buildDeleteWarning()
                    : Column(
                        crossAxisAlignment: CrossAxisAlignment.stretch,
                        children: [
                          if (widget.mode == VehicleModalMode.add) ...[
                            _buildSectionHeader('Información del estudiante'),
                            _CleanField(
                              label: 'Nombre completo',
                              hint: 'María García López',
                              controller: _studentNameCtrl,
                            ),
                            const SizedBox(height: 16),
                            _CleanField(
                              label: 'Matrícula',
                              hint: '9 dígitos sin espacios',
                              controller: _studentIdCtrl,
                              keyboardType: TextInputType.number,
                              error: _matriculaError,
                            ),
                          ],

                          _buildSectionHeader('Detalles del Vehículo'),
                          _CleanField(
                            label: 'Placa',
                            hint: 'Ej: TNA-123',
                            controller: _plateCtrl,
                            textCapitalization: TextCapitalization.characters,
                            error: _plateError,
                          ),
                          const SizedBox(height: 16),

                          // Tipo de vehículo - Pills en lugar de Dropdown
                          Text(
                            'Tipo de vehículo',
                            style: GoogleFonts.inter(
                              fontSize: 13,
                              fontWeight: FontWeight.w600,
                              color: AppColors.slate700,
                            ),
                          ),
                          const SizedBox(height: 8),
                          Container(
                            padding: const EdgeInsets.all(4),
                            decoration: BoxDecoration(
                              color: AppColors.slate100,
                              borderRadius: AppRadius.lg,
                            ),
                            child: Row(
                              children: [
                                _buildVehicleTypePill(
                                  'moto',
                                  'Moto',
                                  Icons.motorcycle_outlined,
                                ),
                                _buildVehicleTypePill(
                                  'carro',
                                  'Carro',
                                  Icons.directions_car_outlined,
                                ),
                                _buildVehicleTypePill(
                                  'bici',
                                  'Bici',
                                  Icons.pedal_bike_outlined,
                                ),
                              ],
                            ),
                          ),

                          if (needsHelmet) ...[
                            const SizedBox(height: 24),
                            Container(
                              padding: const EdgeInsets.all(16),
                              decoration: BoxDecoration(
                                color: AppColors.slate50,
                                borderRadius: AppRadius.lg,
                              ),
                              child: Column(
                                children: [
                                  Row(
                                    mainAxisAlignment:
                                        MainAxisAlignment.spaceBetween,
                                    children: [
                                      Row(
                                        children: [
                                          const Icon(
                                            LucideIcons.hardHat,
                                            size: 18,
                                            color: AppColors.slate500,
                                          ),
                                          const SizedBox(width: 8),
                                          Text(
                                            '¿Tiene casco?',
                                            style: GoogleFonts.inter(
                                              fontWeight: FontWeight.w600,
                                              color: AppColors.slate700,
                                              fontSize: 14,
                                            ),
                                          ),
                                        ],
                                      ),
                                      Row(
                                        children: [
                                          GestureDetector(
                                            onTap: () => setState(
                                              () => _hasHelmet = true,
                                            ),
                                            child: Container(
                                              padding:
                                                  const EdgeInsets.symmetric(
                                                    horizontal: 16,
                                                    vertical: 8,
                                                  ),
                                              decoration: BoxDecoration(
                                                color: _hasHelmet
                                                    ? AppColors.slate900
                                                    : Colors.transparent,
                                                borderRadius:
                                                    BorderRadius.circular(20),
                                              ),
                                              child: Text(
                                                'Sí',
                                                style: GoogleFonts.inter(
                                                  color: _hasHelmet
                                                      ? AppColors.white
                                                      : AppColors.slate500,
                                                  fontSize: 13,
                                                  fontWeight: FontWeight.w600,
                                                ),
                                              ),
                                            ),
                                          ),
                                          const SizedBox(width: 4),
                                          GestureDetector(
                                            onTap: () => setState(
                                              () => _hasHelmet = false,
                                            ),
                                            child: Container(
                                              padding:
                                                  const EdgeInsets.symmetric(
                                                    horizontal: 16,
                                                    vertical: 8,
                                                  ),
                                              decoration: BoxDecoration(
                                                color: !_hasHelmet
                                                    ? AppColors.errorLight
                                                    : Colors.transparent,
                                                borderRadius:
                                                    BorderRadius.circular(20),
                                              ),
                                              child: Text(
                                                'No',
                                                style: GoogleFonts.inter(
                                                  color: !_hasHelmet
                                                      ? AppColors.error
                                                      : AppColors.slate500,
                                                  fontSize: 13,
                                                  fontWeight: FontWeight.w600,
                                                ),
                                              ),
                                            ),
                                          ),
                                        ],
                                      ),
                                    ],
                                  ),
                                  if (_hasHelmet) ...[
                                    const Padding(
                                      padding: EdgeInsets.symmetric(
                                        vertical: 12,
                                      ),
                                      child: Divider(),
                                    ),
                                    Row(
                                      mainAxisAlignment:
                                          MainAxisAlignment.spaceBetween,
                                      children: [
                                        Text(
                                          'Cantidad de cascos',
                                          style: GoogleFonts.inter(
                                            fontSize: 13,
                                            color: AppColors.slate600,
                                          ),
                                        ),
                                        Row(
                                          children: [
                                            _buildCounterBtn(
                                              LucideIcons.minus,
                                              () => _updateHelmetCount(
                                                _helmetCount - 1,
                                              ),
                                              _helmetCount > 1,
                                            ),
                                            SizedBox(
                                              width: 32,
                                              child: Text(
                                                '$_helmetCount',
                                                textAlign: TextAlign.center,
                                                style: GoogleFonts.inter(
                                                  fontWeight: FontWeight.w600,
                                                  fontSize: 14,
                                                  color: AppColors.slate900,
                                                ),
                                              ),
                                            ),
                                            _buildCounterBtn(
                                              LucideIcons.plus,
                                              () => _updateHelmetCount(
                                                _helmetCount + 1,
                                              ),
                                              _helmetCount < 4,
                                            ),
                                          ],
                                        ),
                                      ],
                                    ),
                                    const SizedBox(height: 12),
                                    ...List.generate(
                                      _helmetCount,
                                      (i) => Padding(
                                        padding: const EdgeInsets.only(
                                          bottom: 8,
                                        ),
                                        child: _CleanField(
                                          controller: _helmetCtrls[i],
                                          hint:
                                              'Casco ${i + 1}: color, marca...',
                                          hideLabel: true,
                                        ),
                                      ),
                                    ),
                                  ],
                                ],
                              ),
                            ),
                          ],

                          if (needsVehicleDetails) ...[
                            const SizedBox(height: 24),
                            Text(
                              'Observaciones e Identificación',
                              style: GoogleFonts.inter(
                                fontSize: 13,
                                fontWeight: FontWeight.w600,
                                color: AppColors.slate700,
                              ),
                            ),
                            const SizedBox(height: 8),
                            _CleanField(
                              controller: _descCtrl,
                              hint: 'Marca, color o detalle visible...',
                              hideLabel: true,
                              maxLines: 2,
                            ),
                            const SizedBox(height: 12),

                            // Caja de foto suave y limpia
                            if (_vehiclePhotoUrl != null)
                              Stack(
                                children: [
                                  ClipRRect(
                                    borderRadius: AppRadius.lg,
                                    child: _pendingPhotoFile != null
                                        ? Image.file(
                                            _pendingPhotoFile!,
                                            height: 160,
                                            width: double.infinity,
                                            fit: BoxFit.cover,
                                          )
                                        : Image.network(
                                            _vehiclePhotoUrl!,
                                            height: 160,
                                            width: double.infinity,
                                            fit: BoxFit.cover,
                                            errorBuilder: (_, _, _) =>
                                                Container(
                                                  height: 160,
                                                  color: AppColors.slate100,
                                                ),
                                          ),
                                  ),
                                  Positioned(
                                    top: 8,
                                    right: 8,
                                    child: GestureDetector(
                                      onTap: () => setState(() {
                                        _vehiclePhotoUrl = null;
                                        _pendingPhotoFile = null;
                                      }),
                                      child: Container(
                                        decoration: BoxDecoration(
                                          shape: BoxShape.circle,
                                          color: Colors.black.withValues(
                                            alpha: 0.5,
                                          ),
                                        ),
                                        padding: const EdgeInsets.all(6),
                                        child: const Icon(
                                          LucideIcons.x,
                                          size: 16,
                                          color: Colors.white,
                                        ),
                                      ),
                                    ),
                                  ),
                                ],
                              )
                            else
                              GestureDetector(
                                onTap: _pickImage,
                                child: Container(
                                  height: 100,
                                  decoration: BoxDecoration(
                                    color: AppColors.slate50,
                                    borderRadius: AppRadius.lg,
                                  ),
                                  child: Column(
                                    mainAxisAlignment: MainAxisAlignment.center,
                                    children: [
                                      Container(
                                        padding: const EdgeInsets.all(10),
                                        decoration: const BoxDecoration(
                                          color: AppColors.white,
                                          shape: BoxShape.circle,
                                        ),
                                        child: const Icon(
                                          LucideIcons.camera,
                                          size: 20,
                                          color: AppColors.slate500,
                                        ),
                                      ),
                                      const SizedBox(height: 8),
                                      Text(
                                        'Agregar fotografía',
                                        style: GoogleFonts.inter(
                                          fontSize: 12,
                                          fontWeight: FontWeight.w500,
                                          color: AppColors.slate500,
                                        ),
                                      ),
                                    ],
                                  ),
                                ),
                              ),
                          ],
                          const SizedBox(height: 40),
                        ],
                      ),
              ),
            ),

            // Footer actions (Fixed at bottom)
            Container(
              padding: const EdgeInsets.fromLTRB(24, 16, 24, 24),
              decoration: BoxDecoration(
                color: AppColors.white,
                border: Border(top: BorderSide(color: AppColors.slate100)),
                borderRadius: const BorderRadius.vertical(
                  bottom: Radius.circular(18),
                ),
              ),
              child: widget.mode == VehicleModalMode.delete
                  ? ElevatedButton(
                      style: ElevatedButton.styleFrom(
                        backgroundColor: AppColors.errorLight,
                        foregroundColor: AppColors.error,
                        elevation: 0,
                        minimumSize: const Size(double.infinity, 52),
                        shape: RoundedRectangleBorder(
                          borderRadius: AppRadius.lg,
                        ),
                      ),
                      onPressed: () {
                        if (widget.initialRecord?.id != null &&
                            widget.onDelete != null) {
                          widget.onDelete!(widget.initialRecord!.id);
                          Navigator.pop(context);
                        }
                      },
                      child: Text(
                        'Eliminar permanentemente',
                        style: GoogleFonts.inter(
                          fontSize: 15,
                          fontWeight: FontWeight.w600,
                        ),
                      ),
                    )
                  : Row(
                      children: [
                        TextButton(
                          style: TextButton.styleFrom(
                            minimumSize: const Size(0, 52),
                            padding: const EdgeInsets.symmetric(horizontal: 24),
                            foregroundColor: AppColors.slate600,
                            shape: RoundedRectangleBorder(
                              borderRadius: AppRadius.lg,
                            ),
                          ),
                          onPressed: () => Navigator.pop(context),
                          child: Text(
                            'Cancelar',
                            style: GoogleFonts.inter(
                              fontSize: 15,
                              fontWeight: FontWeight.w500,
                            ),
                          ),
                        ),
                        const SizedBox(width: 12),
                        Expanded(
                          child: ElevatedButton(
                            style: ElevatedButton.styleFrom(
                              backgroundColor: AppColors.slate900,
                              foregroundColor: AppColors.white,
                              elevation: 0,
                              minimumSize: const Size(double.infinity, 52),
                              shape: RoundedRectangleBorder(
                                borderRadius: AppRadius.lg,
                              ),
                              disabledBackgroundColor: AppColors.slate100,
                              disabledForegroundColor: AppColors.slate400,
                            ),
                            onPressed: (_isFormValid && !_isUploading)
                                ? _handleSave
                                : null,
                            child: widget.mode == VehicleModalMode.add
                                ? Row(
                                    mainAxisAlignment: MainAxisAlignment.center,
                                    children: [
                                      if (_isUploading)
                                        const SizedBox(
                                          width: 16,
                                          height: 16,
                                          child: CircularProgressIndicator(
                                            strokeWidth: 2,
                                            color: AppColors.white,
                                          ),
                                        )
                                      else
                                        const Icon(LucideIcons.check, size: 18),
                                      const SizedBox(width: 8),
                                      Text(
                                        'Registrar vehículo',
                                        style: GoogleFonts.inter(
                                          fontSize: 15,
                                          fontWeight: FontWeight.w600,
                                        ),
                                      ),
                                    ],
                                  )
                                : Text(
                                    'Guardar cambios',
                                    style: GoogleFonts.inter(
                                      fontSize: 15,
                                      fontWeight: FontWeight.w600,
                                    ),
                                  ),
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

  Widget _buildSectionHeader(String text) {
    return Padding(
      padding: const EdgeInsets.only(top: 24, bottom: 16),
      child: Text(
        text.toUpperCase(),
        style: GoogleFonts.inter(
          fontSize: 11,
          fontWeight: FontWeight.w700,
          letterSpacing: 1.2,
          color: AppColors.slate400,
        ),
      ),
    );
  }

  Widget _buildDeleteWarning() {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 24),
      child: Container(
        padding: const EdgeInsets.all(20),
        decoration: BoxDecoration(
          color: AppColors.errorLight,
          borderRadius: AppRadius.lg,
        ),
        child: Row(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const Icon(LucideIcons.alertTriangle, color: AppColors.error),
            const SizedBox(width: 16),
            Expanded(
              child: Text(
                'Al eliminar este vehículo se perderá todo su historial de acceso permanentemente.',
                style: GoogleFonts.inter(
                  fontSize: 14,
                  color: AppColors.error,
                  height: 1.5,
                  fontWeight: FontWeight.w500,
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildVehicleTypePill(String value, String label, IconData icon) {
    final isSelected = _vehicleType == value;
    return Expanded(
      child: GestureDetector(
        onTap: () => setState(() => _vehicleType = value),
        child: Container(
          padding: const EdgeInsets.symmetric(vertical: 10),
          decoration: BoxDecoration(
            color: isSelected ? AppColors.white : Colors.transparent,
            borderRadius: AppRadius.md,
            boxShadow: isSelected
                ? [
                    BoxShadow(
                      color: Colors.black.withValues(alpha: 0.04),
                      blurRadius: 4,
                      offset: const Offset(0, 2),
                    ),
                  ]
                : [],
          ),
          child: Row(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              Icon(
                icon,
                size: 14,
                color: isSelected ? AppColors.slate900 : AppColors.slate500,
              ),
              const SizedBox(width: 6),
              Text(
                label,
                style: GoogleFonts.inter(
                  fontSize: 13,
                  fontWeight: isSelected ? FontWeight.w600 : FontWeight.w500,
                  color: isSelected ? AppColors.slate900 : AppColors.slate500,
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildCounterBtn(IconData icon, VoidCallback onTap, bool enabled) {
    return GestureDetector(
      onTap: enabled ? onTap : null,
      child: Container(
        padding: const EdgeInsets.all(6),
        decoration: BoxDecoration(
          color: AppColors.white,
          shape: BoxShape.circle,
          border: Border.all(color: AppColors.slate200),
          boxShadow: [
            BoxShadow(
              color: Colors.black.withValues(alpha: 0.02),
              blurRadius: 4,
              offset: const Offset(0, 2),
            ),
          ],
        ),
        child: Icon(
          icon,
          size: 14,
          color: enabled ? AppColors.slate700 : AppColors.slate300,
        ),
      ),
    );
  }
}

class _CleanField extends StatelessWidget {
  final String? label;
  final String hint;
  final TextEditingController controller;
  final TextInputType keyboardType;
  final String? error;
  final TextCapitalization textCapitalization;
  final bool hideLabel;
  final int maxLines;

  const _CleanField({
    this.label,
    required this.hint,
    required this.controller,
    this.keyboardType = TextInputType.text,
    this.error,
    this.textCapitalization = TextCapitalization.none,
    this.hideLabel = false,
    this.maxLines = 1,
  });

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        if (!hideLabel && label != null) ...[
          Text(
            label!,
            style: GoogleFonts.inter(
              fontSize: 13,
              fontWeight: FontWeight.w600,
              color: AppColors.slate700,
            ),
          ),
          const SizedBox(height: 8),
        ],
        Container(
          decoration: BoxDecoration(
            color: AppColors.slate100,
            borderRadius: AppRadius.lg,
            border: Border.all(
              color: error != null && error!.isNotEmpty
                  ? AppColors.error.withValues(alpha: 0.3)
                  : Colors.transparent,
            ),
          ),
          child: TextField(
            controller: controller,
            keyboardType: keyboardType,
            textCapitalization: textCapitalization,
            maxLines: maxLines,
            style: GoogleFonts.inter(
              fontSize: 15,
              fontWeight: FontWeight.w500,
              color: AppColors.slate900,
            ),
            decoration: InputDecoration(
              hintText: hint,
              hintStyle: GoogleFonts.inter(
                fontSize: 15,
                color: AppColors.slate400,
                fontWeight: FontWeight.w400,
              ),
              border: InputBorder.none,
              enabledBorder: InputBorder.none,
              focusedBorder: InputBorder.none,
              errorBorder: InputBorder.none,
              focusedErrorBorder: InputBorder.none,
              contentPadding: const EdgeInsets.symmetric(
                horizontal: 16,
                vertical: 14,
              ),
              isDense: true,
              filled: false,
            ),
          ),
        ),
        if (error != null && error!.isNotEmpty)
          Padding(
            padding: const EdgeInsets.only(top: 6, left: 4),
            child: Row(
              children: [
                const Icon(
                  LucideIcons.alertCircle,
                  size: 12,
                  color: AppColors.error,
                ),
                const SizedBox(width: 4),
                Text(
                  error!,
                  style: GoogleFonts.inter(
                    fontSize: 12,
                    color: AppColors.error,
                    fontWeight: FontWeight.w500,
                  ),
                ),
              ],
            ),
          ),
      ],
    );
  }
}

extension on List<TextEditingController> {
  void push(TextEditingController textEditingController) {
    add(textEditingController);
  }
}
