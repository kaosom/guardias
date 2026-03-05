import 'package:flutter/material.dart';
import 'package:camera/camera.dart';
import 'package:lucide_icons/lucide_icons.dart';

class CameraScannerScreen extends StatefulWidget {
  final Function(String) onCapture;

  const CameraScannerScreen({super.key, required this.onCapture});

  @override
  State<CameraScannerScreen> createState() => _CameraScannerScreenState();
}

class _CameraScannerScreenState extends State<CameraScannerScreen>
    with SingleTickerProviderStateMixin {
  CameraController? _controller;
  bool _isReady = false;
  String? _error;
  bool _hasTorch = false;
  bool _torchOn = false;

  late AnimationController _animController;
  late Animation<double> _animation;

  @override
  void initState() {
    super.initState();
    _animController = AnimationController(
      vsync: this,
      duration: const Duration(seconds: 2),
    )..repeat(reverse: true);
    _animation = Tween<double>(begin: 0.1, end: 0.9).animate(
      CurvedAnimation(parent: _animController, curve: Curves.easeInOut),
    );
    _initCamera();
  }

  Future<void> _initCamera() async {
    try {
      final cameras = await availableCameras();
      if (cameras.isEmpty) {
        setState(() => _error = 'No cameras found');
        return;
      }
      final backCamera = cameras.firstWhere(
        (c) => c.lensDirection == CameraLensDirection.back,
        orElse: () => cameras.first,
      );
      _controller = CameraController(
        backCamera,
        ResolutionPreset.high,
        enableAudio: false,
      );
      await _controller!.initialize();
      _hasTorch =
          _controller!.value.flashMode == FlashMode.torch || true; // Simplistic
      if (mounted) setState(() => _isReady = true);
    } catch (e) {
      if (mounted) setState(() => _error = 'Camera error: $e');
    }
  }

  @override
  void dispose() {
    _controller?.dispose();
    _animController.dispose();
    super.dispose();
  }

  Future<void> _toggleTorch() async {
    if (_controller == null || !_isReady) return;
    try {
      if (_torchOn) {
        await _controller!.setFlashMode(FlashMode.off);
        setState(() => _torchOn = false);
      } else {
        await _controller!.setFlashMode(FlashMode.torch);
        setState(() => _torchOn = true);
      }
    } catch (_) {}
  }

  Future<void> _capture() async {
    if (_controller == null || !_isReady || _controller!.value.isTakingPicture)
      return;
    try {
      final xf = await _controller!.takePicture();
      // TODO: recortar la imagen basada en la máscara
      widget.onCapture(xf.path);
      if (mounted) Navigator.pop(context);
    } catch (e) {
      // Manejar error de captura
    }
  }

  @override
  Widget build(BuildContext context) {
    if (_error != null) {
      return Scaffold(
        backgroundColor: Colors.black,
        appBar: AppBar(
          backgroundColor: Colors.black,
          elevation: 0,
          leading: IconButton(
            icon: const Icon(LucideIcons.x),
            onPressed: () => Navigator.pop(context),
          ),
        ),
        body: Center(
          child: Text(_error!, style: const TextStyle(color: Colors.white)),
        ),
      );
    }

    if (!_isReady || _controller == null) {
      return const Scaffold(
        backgroundColor: Colors.black,
        body: Center(child: CircularProgressIndicator(color: Colors.white)),
      );
    }

    return Scaffold(
      backgroundColor: Colors.black,
      body: Stack(
        children: [
          SizedBox.expand(child: CameraPreview(_controller!)),

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
                        'ESCANEAR PLACA',
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
                            _torchOn
                                ? LucideIcons.flashlight
                                : LucideIcons.flashlightOff,
                            color: Colors.white,
                          ),
                          onPressed: _toggleTorch,
                        )
                      else
                        const SizedBox(width: 48),
                    ],
                  ),
                ),
                Expanded(
                  child: Stack(
                    alignment: Alignment.center,
                    children: [
                      CustomPaint(
                        size: Size.infinite,
                        painter: _PlateOverlayPainter(),
                      ),

                      Padding(
                        padding: const EdgeInsets.symmetric(horizontal: 32),
                        child: LayoutBuilder(
                          builder: (context, constraints) {
                            final w = constraints.maxWidth;
                            final h = w * 0.4;
                            return SizedBox(
                              width: w,
                              height: h,
                              child: Stack(
                                children: [
                                  _buildFrameCorners(context),
                                  AnimatedBuilder(
                                    animation: _animation,
                                    builder: (context, child) {
                                      return Positioned(
                                        top: (_animation.value * h - 2).clamp(
                                          0.0,
                                          h,
                                        ),
                                        left: 8,
                                        right: 8,
                                        child: Container(
                                          height: 2,
                                          decoration: BoxDecoration(
                                            color: Theme.of(context)
                                                .primaryColor
                                                .withValues(alpha: 0.8),
                                            boxShadow: [
                                              BoxShadow(
                                                color: Theme.of(
                                                  context,
                                                ).primaryColor,
                                                blurRadius: 4,
                                              ),
                                            ],
                                          ),
                                        ),
                                      );
                                    },
                                  ),
                                ],
                              ),
                            );
                          },
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
                                'Alinea la placa dentro del marco',
                                style: TextStyle(
                                  color: Colors.white70,
                                  fontSize: 12,
                                  fontWeight: FontWeight.w500,
                                ),
                              ),
                            ),
                            const SizedBox(height: 8),
                            const Text(
                              'Procura que haya buena iluminación',
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
                  child: GestureDetector(
                    onTap: _capture,
                    child: Container(
                      height: 64,
                      width: 64,
                      decoration: BoxDecoration(
                        shape: BoxShape.circle,
                        border: Border.all(color: Colors.white, width: 3),
                        color: Colors.white.withValues(alpha: 0.15),
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
                            LucideIcons.scanLine,
                            color: Theme.of(context).primaryColor,
                          ),
                        ),
                      ),
                    ),
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildFrameCorners(BuildContext context) {
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
  }

  Widget _buildCorner({
    required bool top,
    required bool left,
    required BuildContext context,
  }) {
    return Container(
      width: 20,
      height: 20,
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
          topLeft: top && left ? const Radius.circular(8) : Radius.zero,
          topRight: top && !left ? const Radius.circular(8) : Radius.zero,
          bottomLeft: !top && left ? const Radius.circular(8) : Radius.zero,
          bottomRight: !top && !left ? const Radius.circular(8) : Radius.zero,
        ),
      ),
    );
  }
}

class _PlateOverlayPainter extends CustomPainter {
  @override
  void paint(Canvas canvas, Size size) {
    final paint = Paint()..color = Colors.black.withValues(alpha: 0.55);
    final w = size.width - 64; // horizontal padding 32 * 2
    final h = w * 0.4; // aspect ratio matching the frame
    canvas.drawPath(
      Path.combine(
        PathOperation.difference,
        Path()..addRect(Rect.fromLTWH(0, 0, size.width, size.height)),
        Path()..addRect(
          Rect.fromCenter(
            center: Offset(size.width / 2, size.height / 2),
            width: w,
            height: h,
          ),
        ),
      ),
      paint,
    );
  }

  @override
  bool shouldRepaint(covariant CustomPainter oldDelegate) => false;
}
