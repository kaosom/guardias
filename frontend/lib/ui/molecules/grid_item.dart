import 'package:flutter/material.dart';

class GridItem extends StatelessWidget {
  final IconData? icon;
  final String label;
  final String? value;
  final String? valueText;
  final Color? valueColor;
  final bool isMono;
  final Widget? headerAccessory;

  const GridItem({
    super.key,
    this.icon,
    required this.label,
    this.value,
    this.valueText,
    this.valueColor,
    this.isMono = false,
    this.headerAccessory,
  });

  @override
  Widget build(BuildContext context) {
    return Expanded(
      child: Padding(
        padding: const EdgeInsets.symmetric(vertical: 14, horizontal: 8),
        child: Column(
          children: [
            if (icon != null) Icon(icon, size: 20, color: Colors.grey),
            if (icon != null) const SizedBox(height: 6),
            Row(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                Text(
                  label,
                  style: const TextStyle(
                    fontSize: 10,
                    fontWeight: FontWeight.w500,
                    color: Colors.grey,
                  ),
                ),
                if (headerAccessory != null) ...[
                  const SizedBox(width: 4),
                  headerAccessory!,
                ],
              ],
            ),
            const SizedBox(height: 2),
            if (valueText != null || value != null)
              Text(
                valueText ?? value ?? '',
                style: TextStyle(
                  fontSize: isMono ? 16 : 14,
                  fontWeight: FontWeight.bold,
                  color:
                      valueColor ??
                      Theme.of(context).textTheme.bodyLarge?.color,
                  fontFamily: isMono ? 'monospace' : null,
                  letterSpacing: isMono ? 1.5 : null,
                ),
                maxLines: 1,
                overflow: TextOverflow.ellipsis,
              ),
          ],
        ),
      ),
    );
  }
}
