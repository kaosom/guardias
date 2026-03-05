import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';

// ── Design Tokens ──────────────────────────────────────────────────────────
class AppColors {
  // Primary — deep indigo (institutional, trustworthy)
  static const primary = Color(0xFF2563EB); // blue-600
  static const primaryLight = Color(0xFFEFF6FF); // blue-50
  static const primaryMid = Color(0xFFBFDBFE); // blue-200

  // Neutrals — slate scale (cooler and cleaner than grey)
  static const slate50 = Color(0xFFF8FAFC);
  static const slate100 = Color(0xFFF1F5F9);
  static const slate200 = Color(0xFFE2E8F0);
  static const slate300 = Color(0xFFCBD5E1);
  static const slate400 = Color(0xFF94A3B8);
  static const slate500 = Color(0xFF64748B);
  static const slate600 = Color(0xFF475569);
  static const slate700 = Color(0xFF334155);
  static const slate800 = Color(0xFF1E293B);
  static const slate900 = Color(0xFF0F172A);

  // Semantic
  static const success = Color(0xFF16A34A); // green-600
  static const successLight = Color(0xFFF0FDF4); // green-50
  static const error = Color(0xFFDC2626); // red-600
  static const errorLight = Color(0xFFFEF2F2); // red-50
  static const warning = Color(0xFFD97706); // amber-600
  static const warningLight = Color(0xFFFFFBEB); // amber-50

  // Surface
  static const white = Color(0xFFFFFFFF);
  static const background = Color(0xFFF8FAFC);

  // Dark mode
  static const darkBackground = Color(0xFF0F172A);
  static const darkSurface = Color(0xFF1E293B);
  static const darkBorder = Color(0xFF334155);
}

// ── Border Radius ──────────────────────────────────────────────────────────
class AppRadius {
  static const sm = BorderRadius.all(Radius.circular(6));
  static const md = BorderRadius.all(Radius.circular(10));
  static const lg = BorderRadius.all(Radius.circular(14));
  static const xl = BorderRadius.all(Radius.circular(18));
  static const full = BorderRadius.all(Radius.circular(999));
}

// ── Clean border helper ───────────────────────────────────────────────────
UnderlineInputBorder _inputBorder(Color color, {double width = 1}) =>
    UnderlineInputBorder(
      borderSide: BorderSide(color: color, width: width),
    );

// ── Theme ─────────────────────────────────────────────────────────────────
class AppTheme {
  static TextTheme _textTheme(Color base) => GoogleFonts.interTextTheme(
    TextTheme(
      // Display
      displayLarge: TextStyle(
        color: base,
        fontWeight: FontWeight.w700,
        letterSpacing: -0.5,
      ),
      displayMedium: TextStyle(
        color: base,
        fontWeight: FontWeight.w700,
        letterSpacing: -0.5,
      ),
      // Title
      titleLarge: TextStyle(
        color: base,
        fontWeight: FontWeight.w600,
        letterSpacing: -0.3,
      ),
      titleMedium: TextStyle(
        color: base,
        fontWeight: FontWeight.w600,
        letterSpacing: -0.2,
      ),
      titleSmall: TextStyle(color: base, fontWeight: FontWeight.w500),
      // Body
      bodyLarge: TextStyle(
        color: base,
        fontWeight: FontWeight.w400,
        height: 1.6,
      ),
      bodyMedium: TextStyle(
        color: base,
        fontWeight: FontWeight.w400,
        height: 1.6,
      ),
      bodySmall: TextStyle(
        color: base.withValues(alpha: 0.65),
        fontWeight: FontWeight.w400,
        fontSize: 12,
      ),
      // Label
      labelLarge: TextStyle(
        color: base,
        fontWeight: FontWeight.w500,
        letterSpacing: 0.1,
      ),
      labelSmall: TextStyle(
        color: base.withValues(alpha: 0.6),
        fontWeight: FontWeight.w500,
        fontSize: 11,
        letterSpacing: 0.3,
      ),
    ),
  );

  // ── Light ────────────────────────────────────────────────────────────
  static ThemeData get lightTheme {
    const cs = ColorScheme(
      brightness: Brightness.light,
      primary: AppColors.primary,
      onPrimary: AppColors.white,
      primaryContainer: AppColors.primaryLight,
      onPrimaryContainer: AppColors.primary,
      secondary: AppColors.slate700,
      onSecondary: AppColors.white,
      secondaryContainer: AppColors.slate100,
      onSecondaryContainer: AppColors.slate700,
      surface: AppColors.background,
      onSurface: AppColors.slate900,
      error: AppColors.error,
      onError: AppColors.white,
      errorContainer: AppColors.errorLight,
      onErrorContainer: AppColors.error,
      outline: AppColors.slate200,
      outlineVariant: AppColors.slate100,
      surfaceContainerHighest: AppColors.white,
      inverseSurface: AppColors.slate900,
      onInverseSurface: AppColors.slate50,
      shadow: Color(0x0C0F1729),
    );

    return _build(cs, _textTheme(AppColors.slate900), Brightness.light);
  }

  // ── Dark ─────────────────────────────────────────────────────────────
  static ThemeData get darkTheme {
    const cs = ColorScheme(
      brightness: Brightness.dark,
      primary: Color(0xFF60A5FA), // blue-400
      onPrimary: AppColors.slate900,
      primaryContainer: Color(0xFF1E3A5F),
      onPrimaryContainer: Color(0xFFBFDBFE),
      secondary: AppColors.slate300,
      onSecondary: AppColors.slate900,
      secondaryContainer: AppColors.slate700,
      onSecondaryContainer: AppColors.slate200,
      surface: AppColors.darkBackground,
      onSurface: AppColors.slate100,
      error: Color(0xFFF87171), // red-400
      onError: AppColors.slate900,
      errorContainer: Color(0xFF7F1D1D),
      onErrorContainer: Color(0xFFFCA5A5),
      outline: AppColors.darkBorder,
      outlineVariant: Color(0xFF1E293B),
      surfaceContainerHighest: AppColors.darkSurface,
      inverseSurface: AppColors.slate100,
      onInverseSurface: AppColors.slate900,
      shadow: Color(0x1A000000),
    );

    return _build(cs, _textTheme(AppColors.slate100), Brightness.dark);
  }

  // ── Common builder ────────────────────────────────────────────────────
  static ThemeData _build(ColorScheme cs, TextTheme tt, Brightness brightness) {
    final isLight = brightness == Brightness.light;
    final borderColor = isLight ? AppColors.slate200 : AppColors.darkBorder;
    final fillColor = isLight ? AppColors.slate50 : AppColors.darkSurface;

    return ThemeData(
      useMaterial3: true,
      colorScheme: cs,
      brightness: brightness,
      textTheme: tt,
      scaffoldBackgroundColor: cs.surface,

      // ── AppBar ──────────────────────────────────────────────────────
      appBarTheme: AppBarTheme(
        centerTitle: false,
        elevation: 0,
        scrolledUnderElevation: 0,
        backgroundColor: isLight ? AppColors.white : AppColors.darkSurface,
        foregroundColor: cs.onSurface,
        titleTextStyle: GoogleFonts.inter(
          fontSize: 15,
          fontWeight: FontWeight.w600,
          color: cs.onSurface,
          letterSpacing: -0.2,
        ),
        toolbarHeight: 56,
      ),

      // ── Card ─────────────────────────────────────────────────────────
      cardTheme: CardThemeData(
        elevation: 0,
        color: isLight ? AppColors.white : AppColors.darkSurface,
        shape: RoundedRectangleBorder(
          borderRadius: AppRadius.lg,
          side: BorderSide(color: borderColor, width: 1),
        ),
        margin: EdgeInsets.zero,
      ),

      // ── Input ─────────────────────────────────────────────────────────
      inputDecorationTheme: InputDecorationTheme(
        filled: true,
        fillColor: fillColor,
        contentPadding: const EdgeInsets.symmetric(
          horizontal: 14,
          vertical: 13,
        ),
        border: _inputBorder(borderColor),
        enabledBorder: _inputBorder(borderColor),
        focusedBorder: _inputBorder(cs.primary, width: 1.5),
        errorBorder: _inputBorder(cs.error),
        focusedErrorBorder: _inputBorder(cs.error, width: 1.5),
        hintStyle: GoogleFonts.inter(
          fontSize: 14,
          color: isLight ? AppColors.slate400 : AppColors.slate500,
        ),
        labelStyle: GoogleFonts.inter(
          fontSize: 12,
          fontWeight: FontWeight.w500,
          color: isLight ? AppColors.slate600 : AppColors.slate400,
        ),
        errorStyle: GoogleFonts.inter(fontSize: 11, color: cs.error),
        isDense: true,
      ),

      // ── ElevatedButton ────────────────────────────────────────────────
      elevatedButtonTheme: ElevatedButtonThemeData(
        style: ElevatedButton.styleFrom(
          elevation: 0,
          backgroundColor: cs.primary,
          foregroundColor: cs.onPrimary,
          disabledBackgroundColor: cs.primary.withValues(alpha: 0.35),
          disabledForegroundColor: cs.onPrimary.withValues(alpha: 0.65),
          shape: const RoundedRectangleBorder(borderRadius: AppRadius.md),
          padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 13),
          textStyle: GoogleFonts.inter(
            fontSize: 14,
            fontWeight: FontWeight.w600,
            letterSpacing: 0.1,
          ),
          minimumSize: const Size(0, 44),
        ),
      ),

      // ── OutlinedButton ────────────────────────────────────────────────
      outlinedButtonTheme: OutlinedButtonThemeData(
        style: OutlinedButton.styleFrom(
          elevation: 0,
          foregroundColor: cs.onSurface,
          side: BorderSide(color: borderColor),
          shape: const RoundedRectangleBorder(borderRadius: AppRadius.md),
          padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 13),
          textStyle: GoogleFonts.inter(
            fontSize: 14,
            fontWeight: FontWeight.w500,
          ),
          minimumSize: const Size(0, 44),
        ),
      ),

      // ── TextButton ────────────────────────────────────────────────────
      textButtonTheme: TextButtonThemeData(
        style: TextButton.styleFrom(
          foregroundColor: cs.primary,
          padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
          shape: const RoundedRectangleBorder(borderRadius: AppRadius.md),
          textStyle: GoogleFonts.inter(
            fontSize: 13,
            fontWeight: FontWeight.w500,
          ),
          minimumSize: const Size(0, 36),
        ),
      ),

      // ── IconButton ────────────────────────────────────────────────────
      iconButtonTheme: IconButtonThemeData(
        style: IconButton.styleFrom(
          shape: const RoundedRectangleBorder(borderRadius: AppRadius.sm),
          minimumSize: const Size(36, 36),
        ),
      ),

      // ── Dialog ────────────────────────────────────────────────────────
      dialogTheme: DialogThemeData(
        elevation: 0,
        backgroundColor: isLight ? AppColors.white : AppColors.darkSurface,
        shape: RoundedRectangleBorder(
          borderRadius: AppRadius.xl,
          side: BorderSide(color: borderColor),
        ),
        titleTextStyle: GoogleFonts.inter(
          fontSize: 16,
          fontWeight: FontWeight.w600,
          color: cs.onSurface,
          letterSpacing: -0.2,
        ),
        contentTextStyle: GoogleFonts.inter(
          fontSize: 14,
          color: isLight ? AppColors.slate600 : AppColors.slate400,
          height: 1.6,
        ),
      ),

      // ── Divider ───────────────────────────────────────────────────────
      dividerTheme: DividerThemeData(
        color: borderColor,
        thickness: 1,
        space: 1,
      ),

      // ── Chip ──────────────────────────────────────────────────────────
      chipTheme: ChipThemeData(
        backgroundColor: isLight ? AppColors.slate100 : AppColors.slate700,
        labelStyle: GoogleFonts.inter(
          fontSize: 12,
          fontWeight: FontWeight.w500,
        ),
        side: BorderSide(color: borderColor, width: 0),
        shape: const RoundedRectangleBorder(borderRadius: AppRadius.full),
        padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
      ),

      // ── SnackBar ──────────────────────────────────────────────────────
      snackBarTheme: SnackBarThemeData(
        behavior: SnackBarBehavior.floating,
        backgroundColor: isLight ? AppColors.slate900 : AppColors.white,
        contentTextStyle: GoogleFonts.inter(
          fontSize: 13,
          color: isLight ? AppColors.white : AppColors.slate900,
        ),
        shape: const RoundedRectangleBorder(borderRadius: AppRadius.md),
      ),

      // ── Progress indicator ─────────────────────────────────────────────
      progressIndicatorTheme: ProgressIndicatorThemeData(color: cs.primary),
    );
  }
}
