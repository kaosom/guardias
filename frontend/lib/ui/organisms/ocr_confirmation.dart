import 'dart:io';
import 'package:flutter/material.dart';
import 'package:lucide_icons/lucide_icons.dart';
import '../../../core/utils/validation.dart';

class OcrConfirmationScreen extends StatefulWidget {
  final String imagePath;
  final String detectedPlate;
  final Function(String) onConfirm;
  final VoidCallback onRetry;

  const OcrConfirmationScreen({
    super.key,
    required this.imagePath,
    required this.detectedPlate,
    required this.onConfirm,
    required this.onRetry,
  });

  @override
  State<OcrConfirmationScreen> createState() => _OcrConfirmationScreenState();
}

class _OcrConfirmationScreenState extends State<OcrConfirmationScreen> {
  late TextEditingController _plateCtrl;
  bool _isEditing = false;
  bool _isProcessing = true;
  String _error = '';

  @override
  void initState() {
    super.initState();
    _plateCtrl = TextEditingController(text: widget.detectedPlate);
    _validate();
    _plateCtrl.addListener(_validate);

    Future.delayed(const Duration(milliseconds: 1800), () {
      if (mounted) setState(() => _isProcessing = false);
    });
  }

  @override
  void dispose() {
    _plateCtrl.dispose();
    super.dispose();
  }

  void _validate() {
    final formatted = formatPueblaPlate(_plateCtrl.text);
    if (formatted != _plateCtrl.text && _plateCtrl.text.isNotEmpty) {
      final sel = _plateCtrl.selection;
      _plateCtrl.value = TextEditingValue(text: formatted, selection: sel);
    }
    final res = validatePlateWithMessage(_plateCtrl.text);
    if (mounted)
      setState(
        () => _error = res.isValid ? '' : (res.error ?? 'Error de placa'),
      );
  }

  void _handleConfirm() {
    if (_error.isEmpty && _plateCtrl.text.isNotEmpty) {
      widget.onConfirm(_plateCtrl.text);
      Navigator.pop(context);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.black.withValues(alpha: 0.95),
      body: SafeArea(
        child: Column(
          children: [
            Padding(
              padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
              child: Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  IconButton(
                    icon: const Icon(LucideIcons.x, color: Colors.white),
                    onPressed: () => Navigator.pop(context),
                  ),
                  Text(
                    _isProcessing ? 'Procesando...' : 'Confirmar Placa',
                    style: const TextStyle(
                      color: Colors.white,
                      fontSize: 12,
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                  const SizedBox(width: 48),
                ],
              ),
            ),

            Expanded(
              child: Center(
                child: SingleChildScrollView(
                  padding: const EdgeInsets.symmetric(horizontal: 24),
                  child: Column(
                    children: [
                      Container(
                        width: double.infinity,
                        constraints: const BoxConstraints(maxWidth: 320),
                        child: Stack(
                          alignment: Alignment.center,
                          children: [
                            ClipRRect(
                              borderRadius: BorderRadius.circular(16),
                              child: Image.file(
                                File(widget.imagePath),
                                fit: BoxFit.cover,
                              ),
                            ),
                            if (_isProcessing)
                              Positioned.fill(
                                child: Container(
                                  decoration: BoxDecoration(
                                    color: Colors.black.withValues(alpha: 0.6),
                                    borderRadius: BorderRadius.circular(16),
                                  ),
                                  child: const Column(
                                    mainAxisAlignment: MainAxisAlignment.center,
                                    children: [
                                      SizedBox(
                                        height: 32,
                                        width: 32,
                                        child: CircularProgressIndicator(
                                          color: Colors.blueAccent,
                                        ),
                                      ),
                                      SizedBox(height: 12),
                                      Text(
                                        'Analizando placa...',
                                        style: TextStyle(
                                          color: Colors.white,
                                          fontSize: 12,
                                          fontWeight: FontWeight.w500,
                                        ),
                                      ),
                                    ],
                                  ),
                                ),
                              ),
                          ],
                        ),
                      ),

                      if (!_isProcessing) ...[
                        const SizedBox(height: 24),
                        Container(
                          width: double.infinity,
                          constraints: const BoxConstraints(maxWidth: 320),
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.stretch,
                            children: [
                              Row(
                                mainAxisAlignment:
                                    MainAxisAlignment.spaceBetween,
                                children: [
                                  const Text(
                                    'Placa detectada',
                                    style: TextStyle(
                                      color: Colors.white,
                                      fontSize: 12,
                                      fontWeight: FontWeight.w500,
                                    ),
                                  ),
                                  if (!_isEditing)
                                    TextButton.icon(
                                      style: TextButton.styleFrom(
                                        foregroundColor: Colors.blueAccent,
                                        padding: const EdgeInsets.symmetric(
                                          horizontal: 8,
                                          vertical: 4,
                                        ),
                                        minimumSize: Size.zero,
                                      ),
                                      onPressed: () =>
                                          setState(() => _isEditing = true),
                                      icon: const Icon(
                                        LucideIcons.pencil,
                                        size: 12,
                                      ),
                                      label: const Text(
                                        'Editar',
                                        style: TextStyle(fontSize: 12),
                                      ),
                                    ),
                                ],
                              ),
                              const SizedBox(height: 8),

                              if (_isEditing)
                                TextField(
                                  controller: _plateCtrl,
                                  autofocus: true,
                                  textAlign: TextAlign.center,
                                  textCapitalization:
                                      TextCapitalization.characters,
                                  style: TextStyle(
                                    fontSize: 20,
                                    fontFamily: 'monospace',
                                    fontWeight: FontWeight.bold,
                                    letterSpacing: 2,
                                    color: _error.isEmpty
                                        ? Colors.greenAccent
                                        : Colors.redAccent,
                                  ),
                                  decoration: InputDecoration(
                                    filled: true,
                                    fillColor: Colors.white.withValues(
                                      alpha: 0.1,
                                    ),
                                    enabledBorder: OutlineInputBorder(
                                      borderRadius: BorderRadius.circular(12),
                                      borderSide: BorderSide(
                                        color: _error.isEmpty
                                            ? Colors.greenAccent
                                            : Colors.redAccent,
                                        width: 2,
                                      ),
                                    ),
                                    focusedBorder: OutlineInputBorder(
                                      borderRadius: BorderRadius.circular(12),
                                      borderSide: BorderSide(
                                        color: _error.isEmpty
                                            ? Colors.greenAccent
                                            : Colors.redAccent,
                                        width: 2,
                                      ),
                                    ),
                                  ),
                                )
                              else
                                Container(
                                  height: 48,
                                  alignment: Alignment.center,
                                  decoration: BoxDecoration(
                                    color: Colors.white.withValues(alpha: 0.1),
                                    borderRadius: BorderRadius.circular(12),
                                    border: Border.all(
                                      color: Colors.greenAccent,
                                      width: 2,
                                    ),
                                  ),
                                  child: Text(
                                    _plateCtrl.text,
                                    style: const TextStyle(
                                      fontSize: 20,
                                      fontFamily: 'monospace',
                                      fontWeight: FontWeight.bold,
                                      letterSpacing: 2,
                                      color: Colors.greenAccent,
                                    ),
                                  ),
                                ),

                              if (_error.isNotEmpty) ...[
                                const SizedBox(height: 12),
                                Container(
                                  padding: const EdgeInsets.all(8),
                                  decoration: BoxDecoration(
                                    color: Colors.redAccent.withValues(
                                      alpha: 0.1,
                                    ),
                                    border: Border.all(
                                      color: Colors.redAccent.withValues(
                                        alpha: 0.2,
                                      ),
                                    ),
                                    borderRadius: BorderRadius.circular(8),
                                  ),
                                  child: Row(
                                    children: [
                                      const Icon(
                                        LucideIcons.alertCircle,
                                        size: 14,
                                        color: Colors.redAccent,
                                      ),
                                      const SizedBox(width: 8),
                                      Expanded(
                                        child: Text(
                                          _error,
                                          style: const TextStyle(
                                            color: Colors.redAccent,
                                            fontSize: 11,
                                          ),
                                        ),
                                      ),
                                    ],
                                  ),
                                ),
                              ],

                              const SizedBox(height: 24),

                              ElevatedButton.icon(
                                style: ElevatedButton.styleFrom(
                                  backgroundColor: Colors.green,
                                  foregroundColor: Colors.white,
                                  minimumSize: const Size(double.infinity, 44),
                                  shape: RoundedRectangleBorder(
                                    borderRadius: BorderRadius.circular(12),
                                  ),
                                ),
                                onPressed:
                                    _error.isEmpty && _plateCtrl.text.isNotEmpty
                                    ? _handleConfirm
                                    : null,
                                icon: const Icon(
                                  LucideIcons.checkCircle2,
                                  size: 16,
                                ),
                                label: const Text(
                                  'Confirmar y buscar',
                                  style: TextStyle(fontWeight: FontWeight.bold),
                                ),
                              ),
                              const SizedBox(height: 12),
                              OutlinedButton.icon(
                                style: OutlinedButton.styleFrom(
                                  foregroundColor: Colors.white,
                                  side: const BorderSide(color: Colors.white24),
                                  minimumSize: const Size(double.infinity, 40),
                                  shape: RoundedRectangleBorder(
                                    borderRadius: BorderRadius.circular(12),
                                  ),
                                ),
                                onPressed: () {
                                  Navigator.pop(context);
                                  widget.onRetry();
                                },
                                icon: const Icon(
                                  LucideIcons.rotateCcw,
                                  size: 16,
                                ),
                                label: const Text('Capturar otra vez'),
                              ),
                            ],
                          ),
                        ),
                      ],
                    ],
                  ),
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }
}
