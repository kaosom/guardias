import 'dart:convert';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:lucide_icons/lucide_icons.dart';
import '../../../core/network/api_client.dart';
import '../data/auth_repository.dart';
import '../../../ui/atoms/primary_button.dart';
import '../../../ui/atoms/custom_text_field.dart';
import '../../../core/theme/app_theme.dart';

class LoginScreen extends ConsumerStatefulWidget {
  const LoginScreen({super.key});

  @override
  ConsumerState<LoginScreen> createState() => _LoginScreenState();
}

class _LoginScreenState extends ConsumerState<LoginScreen> {
  final _emailController = TextEditingController();
  final _passwordController = TextEditingController();
  final _formKey = GlobalKey<FormState>();

  String _error = '';
  bool _isLoading = false;

  static const String _buapLogoAsset = 'assets/images/buap_logo.png';

  @override
  void dispose() {
    _emailController.dispose();
    _passwordController.dispose();
    super.dispose();
  }

  Future<void> _handleSubmit() async {
    if (!_formKey.currentState!.validate()) return;

    setState(() {
      _error = '';
      _isLoading = true;
    });

    try {
      final res = await ApiClient.post(
        '/api/auth/login',
        body: jsonEncode({
          'email': _emailController.text.trim(),
          'password': _passwordController.text,
        }),
      );

      if (res.statusCode != 200) {
        final data = jsonDecode(res.body);
        setState(() {
          _error = data['error'] ?? 'Credenciales incorrectas.';
        });
        return;
      }

      final data = jsonDecode(res.body);
      if (data['user'] != null) {
        final user = SessionUser.fromJson(data['user']);
        await ref.read(authProvider.notifier).setUser(user);
        if (mounted) context.go('/');
      }
    } catch (e) {
      setState(() {
        _error = 'Error de conexión. Verifica que el servidor esté activo.';
      });
    } finally {
      if (mounted) setState(() => _isLoading = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.slate50,
      body: Center(
        child: SingleChildScrollView(
          padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 48),
          child: ConstrainedBox(
            constraints: const BoxConstraints(maxWidth: 380),
            child: Column(
              mainAxisAlignment: MainAxisAlignment.center,
              crossAxisAlignment: CrossAxisAlignment.stretch,
              children: [
                // ── Logotype ──────────────────────────────────────────
                Column(
                  children: [
                    Container(
                      width: 150,
                      height: 150,

                      padding: const EdgeInsets.all(8),
                      child: Image.asset(_buapLogoAsset, fit: BoxFit.contain),
                    ),
                    const SizedBox(height: 16),
                    Text(
                      'Control de Acceso',
                      style: GoogleFonts.inter(
                        fontSize: 20,
                        fontWeight: FontWeight.w700,
                        color: AppColors.slate900,
                        letterSpacing: -0.5,
                      ),
                    ),
                    const SizedBox(height: 4),
                    Text(
                      'Benemérita Universidad Autónoma de Puebla',
                      style: GoogleFonts.inter(
                        fontSize: 12,
                        color: AppColors.slate400,
                        fontWeight: FontWeight.w400,
                      ),
                      textAlign: TextAlign.center,
                    ),
                  ],
                ),

                const SizedBox(height: 32),

                // ── Form card ─────────────────────────────────────────
                Container(
                  padding: const EdgeInsets.all(24),
                  decoration: BoxDecoration(
                    color: AppColors.white,
                    borderRadius: AppRadius.xl,
                    border: Border.all(color: AppColors.slate200),
                    boxShadow: [
                      BoxShadow(
                        color: Colors.black.withValues(alpha: 0.04),
                        blurRadius: 16,
                        offset: const Offset(0, 4),
                      ),
                    ],
                  ),
                  child: Form(
                    key: _formKey,
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.stretch,
                      children: [
                        Text(
                          'Iniciar sesión',
                          style: GoogleFonts.inter(
                            fontSize: 15,
                            fontWeight: FontWeight.w600,
                            color: AppColors.slate900,
                            letterSpacing: -0.2,
                          ),
                        ),
                        const SizedBox(height: 4),
                        Text(
                          'Ingresa tus credenciales para continuar.',
                          style: GoogleFonts.inter(
                            fontSize: 13,
                            color: AppColors.slate400,
                          ),
                        ),
                        const SizedBox(height: 20),

                        CustomTextField(
                          label: 'Correo electrónico',
                          hint: 'admin@buap.mx',
                          controller: _emailController,
                          keyboardType: TextInputType.emailAddress,
                          prefixIcon: LucideIcons.mail,
                          validator: (val) {
                            if (val == null || val.isEmpty) {
                              return 'El correo es obligatorio';
                            }
                            return null;
                          },
                        ),

                        const SizedBox(height: 14),

                        CustomTextField(
                          label: 'Contraseña',
                          hint: 'Tu contraseña',
                          controller: _passwordController,
                          isPassword: true,
                          prefixIcon: LucideIcons.lock,
                          validator: (val) {
                            if (val == null || val.isEmpty) {
                              return 'La contraseña es obligatoria';
                            }
                            return null;
                          },
                        ),

                        // ── Error banner ──────────────────────────────
                        if (_error.isNotEmpty) ...[
                          const SizedBox(height: 14),
                          Container(
                            padding: const EdgeInsets.symmetric(
                              horizontal: 12,
                              vertical: 10,
                            ),
                            decoration: BoxDecoration(
                              color: AppColors.errorLight,
                              borderRadius: AppRadius.md,
                              border: Border.all(
                                color: AppColors.error.withValues(alpha: 0.2),
                              ),
                            ),
                            child: Row(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                const Icon(
                                  LucideIcons.alertCircle,
                                  size: 14,
                                  color: AppColors.error,
                                ),
                                const SizedBox(width: 8),
                                Expanded(
                                  child: Text(
                                    _error,
                                    style: GoogleFonts.inter(
                                      fontSize: 12,
                                      color: AppColors.error,
                                      fontWeight: FontWeight.w500,
                                    ),
                                  ),
                                ),
                              ],
                            ),
                          ),
                        ],

                        const SizedBox(height: 20),

                        PrimaryButton(
                          text: _isLoading
                              ? 'Iniciando sesión…'
                              : 'Iniciar sesión',
                          isLoading: _isLoading,
                          onPressed: _handleSubmit,
                        ),
                      ],
                    ),
                  ),
                ),

                const SizedBox(height: 24),

                // ── Footer ────────────────────────────────────────────
                Row(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    const Icon(
                      LucideIcons.shieldCheck,
                      size: 12,
                      color: AppColors.slate300,
                    ),
                    const SizedBox(width: 6),
                    Text(
                      'Acceso restringido al personal autorizado',
                      style: GoogleFonts.inter(
                        fontSize: 11,
                        color: AppColors.slate400,
                      ),
                    ),
                  ],
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }
}
