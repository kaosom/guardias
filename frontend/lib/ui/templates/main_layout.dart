import 'package:flutter/material.dart';
import '../organisms/guard_header.dart';

class MainLayout extends StatelessWidget {
  final Widget child;

  const MainLayout({super.key, required this.child});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Theme.of(context).colorScheme.surface,
      body: SafeArea(
        child: Column(
          children: [
            const GuardHeader(),
            Expanded(child: child),
          ],
        ),
      ),
    );
  }
}
