import 'package:flutter/material.dart';
import '../../core/theme/app_theme.dart';

/// Clean floating action button — pill shaped, crisp borders, no glass gimmicks.
class LiquidGlassButton extends StatefulWidget {
  final IconData icon;
  final VoidCallback onPressed;
  final bool isAccent;
  final String? tooltip;

  const LiquidGlassButton({
    super.key,
    required this.icon,
    required this.onPressed,
    this.isAccent = false,
    this.tooltip,
  });

  @override
  State<LiquidGlassButton> createState() => _LiquidGlassButtonState();
}

class _LiquidGlassButtonState extends State<LiquidGlassButton>
    with SingleTickerProviderStateMixin {
  late final AnimationController _ac;
  late final Animation<double> _scale;

  @override
  void initState() {
    super.initState();
    _ac = AnimationController(vsync: this, duration: const Duration(milliseconds: 120));
    _scale = Tween<double>(begin: 1.0, end: 0.94).animate(
      CurvedAnimation(parent: _ac, curve: Curves.easeOut),
    );
  }

  @override
  void dispose() {
    _ac.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final cs = Theme.of(context).colorScheme;
    final isDark = Theme.of(context).brightness == Brightness.dark;

    final Color bg     = widget.isAccent ? cs.primary : (isDark ? AppColors.slate700 : AppColors.white);
    final Color border = widget.isAccent ? Colors.transparent : (isDark ? AppColors.darkBorder : AppColors.slate200);
    final Color fg     = widget.isAccent ? cs.onPrimary : cs.onSurface;

    return Tooltip(
      message: widget.tooltip ?? '',
      child: GestureDetector(
        onTapDown: (_) => _ac.forward(),
        onTapUp: (_) { _ac.reverse(); widget.onPressed(); },
        onTapCancel: () => _ac.reverse(),
        child: ScaleTransition(
          scale: _scale,
          child: Container(
            height: 52,
            width: 52,
            decoration: BoxDecoration(
              color: bg,
              borderRadius: AppRadius.lg,
              border: Border.all(color: border),
              boxShadow: [
                BoxShadow(
                  color: Colors.black.withOpacity(isDark ? 0.3 : 0.06),
                  blurRadius: 12,
                  offset: const Offset(0, 4),
                ),
              ],
            ),
            child: Center(
              child: Icon(widget.icon, color: fg, size: 20),
            ),
          ),
        ),
      ),
    );
  }
}
