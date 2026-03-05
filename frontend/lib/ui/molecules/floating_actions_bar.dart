import 'package:flutter/material.dart';
import 'package:lucide_icons/lucide_icons.dart';
import '../atoms/liquid_glass_button.dart';

class FloatingActionsBar extends StatelessWidget {
  final VoidCallback onQr;
  final VoidCallback onAdd;

  const FloatingActionsBar({
    super.key,
    required this.onQr,
    required this.onAdd,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: EdgeInsets.only(
        left: 20,
        right: 20,
        bottom: MediaQuery.of(context).padding.bottom + 12,
        top: 12,
      ),
      decoration: BoxDecoration(
        gradient: LinearGradient(
          begin: Alignment.topCenter,
          end: Alignment.bottomCenter,
          colors: [
            Theme.of(context).scaffoldBackgroundColor.withValues(alpha: 0),
            Theme.of(context).scaffoldBackgroundColor.withValues(alpha: 0.85),
            Theme.of(context).scaffoldBackgroundColor.withValues(alpha: 0.98),
          ],
        ),
      ),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          LiquidGlassButton(icon: LucideIcons.qrCode, onPressed: onQr),
          const SizedBox(width: 12),
          LiquidGlassButton(
            icon: LucideIcons.plus,
            onPressed: onAdd,
            isAccent: true,
          ),
        ],
      ),
    );
  }
}
