import 'package:flutter/material.dart';
import 'package:lucide_icons/lucide_icons.dart';
import 'package:mobile_scanner/mobile_scanner.dart';

class QrScannerScreen extends StatefulWidget {
  final Function(String) onScan;

  const QrScannerScreen({super.key, required this.onScan});

  @override
  State<QrScannerScreen> createState() => _QrScannerScreenState();
}

class _QrScannerScreenState extends State<QrScannerScreen>
    with SingleTickerProviderStateMixin {
  final MobileScannerController controller = MobileScannerController(
    formats: [BarcodeFormat.qrCode],
    detectionSpeed: DetectionSpeed.normal,
  );

  bool _isScanning = true;
  bool _hasTorch = false;
  late AnimationController _animationController;
  late Animation<double> _animation;

  @override
  void initState() {
    super.initState();
    _animationController = AnimationController(
      vsync: this,
      duration: const Duration(seconds: 2),
    )..repeat(reverse: true);
    _animation = Tween<double>(begin: 0.1, end: 0.9).animate(
      CurvedAnimation(parent: _animationController, curve: Curves.easeInOut),
    );
    _checkTorch();
  }

  Future<void> _checkTorch() async {
    // Torch state is managed via controller but we flag support via try-catch on startup
    setState(
      () => _hasTorch = true,
    ); // mobile_scanner handles it implicitly via button mostly
  }

  @override
  void dispose() {
    controller.dispose();
    _animationController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.black,
      body: Stack(
        children: [
          MobileScanner(
            controller: controller,
            onDetect: (capture) {
              if (!_isScanning) return;
              final List<Barcode> barcodes = capture.barcodes;
              for (final barcode in barcodes) {
                if (barcode.rawValue != null) {
                  setState(() => _isScanning = false);
                  Navigator.pop(context);
                  widget.onScan(barcode.rawValue!);
                  break;
                }
              }
            },
          ),

          SafeArea(
            child: Column(
              children: [
                Padding(
                  padding: const EdgeInsets.symmetric(
                    horizontal: 16,
                    vertical: 12,
                  ),
                  child: Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      IconButton(
                        icon: const Icon(LucideIcons.x, color: Colors.white),
                        onPressed: () => Navigator.pop(context),
                      ),
                      const Text(
                        'ESCANEAR QR',
                        style: TextStyle(
                          color: Colors.white,
                          fontSize: 12,
                          fontWeight: FontWeight.bold,
                          letterSpacing: 1.5,
                        ),
                      ),
                      if (_hasTorch)
                        IconButton(
                          icon: Icon(
                            _hasTorch
                                ? LucideIcons.flashlight
                                : LucideIcons.flashlightOff,
                            color: Colors.white,
                          ),
                          onPressed: () => controller.toggleTorch(),
                        )
                      else
                        const SizedBox(width: 48), // Match Size for centering
                    ],
                  ),
                ),
                Expanded(
                  child: Stack(
                    alignment: Alignment.center,
                    children: [
                      // Scanner overlay (dimmed background with clear center)
                      CustomPaint(
                        size: Size.infinite,
                        painter: ScannerOverlayPainter(),
                      ),

                      // Focus area frame
                      Padding(
                        padding: const EdgeInsets.symmetric(horizontal: 48),
                        child: AspectRatio(
                          aspectRatio: 1,
                          child: Stack(
                            children: [
                              _buildFrameCorners(),
                              AnimatedBuilder(
                                animation: _animation,
                                builder: (context, child) {
                                  return Positioned(
                                    top:
                                        (_animation.value *
                                                    MediaQuery.of(
                                                      context,
                                                    ).size.width -
                                                96)
                                            .clamp(0.0, double.infinity),
                                    left: 12,
                                    right: 12,
                                    child: Container(
                                      height: 2,
                                      decoration: BoxDecoration(
                                        color: Theme.of(
                                          context,
                                        ).primaryColor.withValues(alpha: 0.8),
                                        boxShadow: [
                                          BoxShadow(
                                            color: Theme.of(
                                              context,
                                            ).primaryColor,
                                            blurRadius: 8,
                                          ),
                                        ],
                                      ),
                                    ),
                                  );
                                },
                              ),
                            ],
                          ),
                        ),
                      ),

                      Positioned(
                        bottom: 80,
                        child: Column(
                          children: [
                            Container(
                              padding: const EdgeInsets.symmetric(
                                horizontal: 16,
                                vertical: 8,
                              ),
                              decoration: const BoxDecoration(
                                color: Colors.black45,
                                borderRadius: BorderRadius.all(
                                  Radius.circular(20),
                                ),
                              ),
                              child: const Text(
                                'Alinea el QR dentro del marco',
                                style: TextStyle(
                                  color: Colors.white70,
                                  fontSize: 12,
                                  fontWeight: FontWeight.w500,
                                ),
                              ),
                            ),
                            const SizedBox(height: 8),
                            const Text(
                              'El estudiante genera su QR desde Autoservicios',
                              style: TextStyle(
                                color: Colors.white38,
                                fontSize: 10,
                              ),
                            ),
                          ],
                        ),
                      ),
                    ],
                  ),
                ),
                Padding(
                  padding: const EdgeInsets.symmetric(vertical: 32),
                  child: Column(
                    children: [
                      GestureDetector(
                        onTap: () {
                          // TEST QRS
                          const demoQRs = [
                            '{"studentId": "202161606", "plate": "ABC-1234", "action": "entry"}',
                            '{"studentId": "111111111", "plate": "XYZ-5678", "action": "exit"}',
                          ];
                          Navigator.pop(context);
                          widget.onScan(
                            demoQRs[DateTime.now().millisecond % 2],
                          );
                        },
                        child: Container(
                          height: 64,
                          width: 64,
                          decoration: BoxDecoration(
                            shape: BoxShape.circle,
                            border: Border.all(color: Colors.white, width: 3),
                            color: Colors.white.withOpacity(0.15),
                          ),
                          child: Center(
                            child: Container(
                              height: 48,
                              width: 48,
                              decoration: const BoxDecoration(
                                shape: BoxShape.circle,
                                color: Colors.white,
                              ),
                              child: Icon(
                                LucideIcons.qrCode,
                                color: Theme.of(context).primaryColor,
                              ),
                            ),
                          ),
                        ),
                      ),
                      const SizedBox(height: 8),
                      const Text(
                        'Pulsa para simular escaneo',
                        style: TextStyle(color: Colors.white54, fontSize: 10),
                      ),
                    ],
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildFrameCorners() {
    return LayoutBuilder(
      builder: (context, constraints) {
        return Stack(
          children: [
            Positioned(
              top: 0,
              left: 0,
              child: _buildCorner(top: true, left: true, context: context),
            ),
            Positioned(
              top: 0,
              right: 0,
              child: _buildCorner(top: true, left: false, context: context),
            ),
            Positioned(
              bottom: 0,
              left: 0,
              child: _buildCorner(top: false, left: true, context: context),
            ),
            Positioned(
              bottom: 0,
              right: 0,
              child: _buildCorner(top: false, left: false, context: context),
            ),
          ],
        );
      },
    );
  }

  Widget _buildCorner({
    required bool top,
    required bool left,
    required BuildContext context,
  }) {
    return Container(
      width: 32,
      height: 32,
      decoration: BoxDecoration(
        border: Border(
          top: top
              ? BorderSide(color: Theme.of(context).primaryColor, width: 3)
              : BorderSide.none,
          bottom: !top
              ? BorderSide(color: Theme.of(context).primaryColor, width: 3)
              : BorderSide.none,
          left: left
              ? BorderSide(color: Theme.of(context).primaryColor, width: 3)
              : BorderSide.none,
          right: !left
              ? BorderSide(color: Theme.of(context).primaryColor, width: 3)
              : BorderSide.none,
        ),
        borderRadius: BorderRadius.only(
          topLeft: top && left ? const Radius.circular(12) : Radius.zero,
          topRight: top && !left ? const Radius.circular(12) : Radius.zero,
          bottomLeft: !top && left ? const Radius.circular(12) : Radius.zero,
          bottomRight: !top && !left ? const Radius.circular(12) : Radius.zero,
        ),
      ),
    );
  }
}

class ScannerOverlayPainter extends CustomPainter {
  @override
  void paint(Canvas canvas, Size size) {
    final paint = Paint()..color = Colors.black.withOpacity(0.6);
    canvas.drawPath(
      Path.combine(
        PathOperation.difference,
        Path()..addRect(Rect.fromLTWH(0, 0, size.width, size.height)),
        Path()..addRect(
          Rect.fromCenter(
            center: Offset(size.width / 2, size.height / 2),
            width: size.width - 96,
            height: size.width - 96,
          ),
        ),
      ),
      paint,
    );
  }

  @override
  bool shouldRepaint(covariant CustomPainter oldDelegate) => false;
}
