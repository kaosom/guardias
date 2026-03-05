import 'dart:convert';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:lucide_icons/lucide_icons.dart';
import '../../core/network/api_client.dart';
import '../../core/utils/locations.dart';
import '../../features/auth/data/auth_repository.dart';
import '../atoms/custom_text_field.dart';
import '../atoms/primary_button.dart';
import '../../core/theme/app_theme.dart';

class Guard {
  final int id;
  final String email;
  final String fullName;
  final int? gate;
  final String? locationName;

  Guard({
    required this.id,
    required this.email,
    required this.fullName,
    this.gate,
    this.locationName,
  });

  factory Guard.fromJson(Map<String, dynamic> json) {
    return Guard(
      id: json['id'],
      email: json['email'],
      fullName: json['fullName'],
      gate: json['gate'],
      locationName: json['locationName'],
    );
  }
}

// ── Header
class GuardHeader extends ConsumerStatefulWidget {
  const GuardHeader({super.key});

  @override
  ConsumerState<GuardHeader> createState() => _GuardHeaderState();
}

class _GuardHeaderState extends ConsumerState<GuardHeader> {
  static const String _buapLogoAsset = 'assets/images/buap_logo.png';

  void _showUserModal(BuildContext context, SessionUser user) {
    showModalBottomSheet(
      context: context,
      backgroundColor: Colors.transparent,
      isScrollControlled: true,
      builder: (ctx) => _UserModal(
        user: user,
        onLogout: () {
          Navigator.pop(ctx);
          ref.read(authProvider.notifier).logout();
        },
      ),
    );
  }

  void _showGateModal(BuildContext context, SessionUser user) {
    showModalBottomSheet(
      context: context,
      backgroundColor: Colors.transparent,
      isScrollControlled: true,
      builder: (ctx) => _GateModal(user: user),
    );
  }

  void _showAdminModal(BuildContext context) {
    showDialog(context: context, builder: (ctx) => const _AdminModal());
  }

  @override
  Widget build(BuildContext context) {
    final user = ref.watch(authProvider).user;

    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 0),
      height: 56,
      decoration: const BoxDecoration(
        color: AppColors.white,
        border: Border(bottom: BorderSide(color: AppColors.slate200, width: 1)),
      ),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          // Brand
          Row(
            children: [
              Image.asset(
                _buapLogoAsset,
                width: 28,
                height: 28,
                fit: BoxFit.contain,
              ),
              const SizedBox(width: 10),
              Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  Text(
                    'Control de Acceso',
                    style: GoogleFonts.inter(
                      fontSize: 13,
                      fontWeight: FontWeight.w600,
                      color: AppColors.slate900,
                      letterSpacing: -0.3,
                    ),
                  ),
                  Text(
                    'BUAP',
                    style: GoogleFonts.inter(
                      fontSize: 10,
                      color: AppColors.slate400,
                      fontWeight: FontWeight.w500,
                    ),
                  ),
                ],
              ),
            ],
          ),

          // Actions
          Row(
            children: [
              if (user?.role == 'admin')
                _HeaderButton(
                  label: 'Administrar',
                  icon: LucideIcons.settings,
                  onPressed: () => _showAdminModal(context),
                ),
              if (user?.role == 'guard' && user != null)
                _HeaderButton(
                  label: 'P ${user.gate ?? '—'}',
                  icon: LucideIcons.doorOpen,
                  onPressed: () => _showGateModal(context, user),
                ),
              const SizedBox(width: 4),
              _AvatarButton(
                name: user?.fullName ?? '',
                onTap: () {
                  if (user != null) _showUserModal(context, user);
                },
              ),
            ],
          ),
        ],
      ),
    );
  }
}

// ── Reusable header button
class _HeaderButton extends StatelessWidget {
  final String label;
  final IconData icon;
  final VoidCallback onPressed;

  const _HeaderButton({
    required this.label,
    required this.icon,
    required this.onPressed,
  });

  @override
  Widget build(BuildContext context) {
    return TextButton.icon(
      style: TextButton.styleFrom(
        padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
        foregroundColor: AppColors.slate600,
        shape: const RoundedRectangleBorder(borderRadius: AppRadius.md),
        textStyle: GoogleFonts.inter(fontSize: 12, fontWeight: FontWeight.w500),
      ),
      icon: Icon(icon, size: 13),
      label: Text(label),
      onPressed: onPressed,
    );
  }
}

// ── Avatar button
class _AvatarButton extends StatelessWidget {
  final String name;
  final VoidCallback onTap;

  const _AvatarButton({required this.name, required this.onTap});

  String get _initials {
    final parts = name.trim().split(' ');
    if (parts.length >= 2)
      return '${parts.first[0]}${parts[1][0]}'.toUpperCase();
    if (parts.isNotEmpty && parts.first.isNotEmpty)
      return parts.first[0].toUpperCase();
    return '?';
  }

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: onTap,
      child: Container(
        height: 32,
        width: 32,
        decoration: BoxDecoration(
          color: AppColors.primaryLight,
          borderRadius: AppRadius.full,
          border: Border.all(color: AppColors.primaryMid),
        ),
        child: Center(
          child: Text(
            _initials,
            style: GoogleFonts.inter(
              fontSize: 11,
              fontWeight: FontWeight.w700,
              color: AppColors.primary,
            ),
          ),
        ),
      ),
    );
  }
}

// ── Modals
class _UserModal extends StatelessWidget {
  final SessionUser user;
  final VoidCallback onLogout;

  const _UserModal({required this.user, required this.onLogout});

  @override
  Widget build(BuildContext context) {
    return SafeArea(
      child: Container(
        margin: const EdgeInsets.fromLTRB(12, 0, 12, 12),
        decoration: const BoxDecoration(
          color: AppColors.white,
          borderRadius: AppRadius.xl,
        ),
        child: Padding(
          padding: const EdgeInsets.fromLTRB(20, 12, 20, 20),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              // Drag handle
              Center(
                child: Container(
                  width: 36,
                  height: 4,
                  margin: const EdgeInsets.only(bottom: 20),
                  decoration: const BoxDecoration(
                    color: AppColors.slate200,
                    borderRadius: AppRadius.full,
                  ),
                ),
              ),
              // Header row
              Row(
                children: [
                  Container(
                    height: 40,
                    width: 40,
                    decoration: const BoxDecoration(
                      color: AppColors.slate100,
                      borderRadius: AppRadius.full,
                    ),
                    child: Center(
                      child: Text(
                        user.fullName.isNotEmpty
                            ? user.fullName[0].toUpperCase()
                            : '?',
                        style: GoogleFonts.inter(
                          fontSize: 15,
                          fontWeight: FontWeight.w600,
                          color: AppColors.slate600,
                        ),
                      ),
                    ),
                  ),
                  const SizedBox(width: 12),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          user.fullName,
                          style: GoogleFonts.inter(
                            fontSize: 15,
                            fontWeight: FontWeight.w600,
                            color: AppColors.slate900,
                          ),
                          maxLines: 1,
                          overflow: TextOverflow.ellipsis,
                        ),
                        const SizedBox(height: 1),
                        Text(
                          user.email,
                          style: GoogleFonts.inter(
                            fontSize: 13,
                            color: AppColors.slate400,
                          ),
                          maxLines: 1,
                          overflow: TextOverflow.ellipsis,
                        ),
                      ],
                    ),
                  ),
                ],
              ),

              const SizedBox(height: 20),

              // Info rows — no borders, just fill
              Container(
                decoration: const BoxDecoration(
                  color: AppColors.slate50,
                  borderRadius: AppRadius.lg,
                ),
                child: Column(
                  children: [
                    _InfoRow(
                      label: 'Puerta asignada',
                      value: 'Puerta ${user.gate ?? "—"}',
                    ),
                    _InfoRow(
                      label: 'Rol',
                      value: user.role == 'admin' ? 'Administrador' : 'Guardia',
                    ),
                  ],
                ),
              ),

              const SizedBox(height: 16),

              // Logout — text button, no outline
              SizedBox(
                height: 44,
                child: TextButton.icon(
                  style: TextButton.styleFrom(
                    foregroundColor: AppColors.error,
                    backgroundColor: AppColors.errorLight,
                    shape: const RoundedRectangleBorder(
                      borderRadius: AppRadius.lg,
                    ),
                  ),
                  onPressed: onLogout,
                  icon: const Icon(LucideIcons.logOut, size: 15),
                  label: Text(
                    'Cerrar sesión',
                    style: GoogleFonts.inter(
                      fontSize: 14,
                      fontWeight: FontWeight.w500,
                    ),
                  ),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}

class _GateModal extends StatelessWidget {
  final SessionUser user;

  const _GateModal({required this.user});

  @override
  Widget build(BuildContext context) {
    return SafeArea(
      child: Container(
        margin: const EdgeInsets.fromLTRB(12, 0, 12, 12),
        decoration: const BoxDecoration(
          color: AppColors.white,
          borderRadius: AppRadius.xl,
        ),
        child: Padding(
          padding: const EdgeInsets.fromLTRB(20, 12, 20, 20),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              // Drag handle
              Center(
                child: Container(
                  width: 36,
                  height: 4,
                  margin: const EdgeInsets.only(bottom: 20),
                  decoration: const BoxDecoration(
                    color: AppColors.slate200,
                    borderRadius: AppRadius.full,
                  ),
                ),
              ),
              Row(
                children: [
                  Container(
                    height: 40,
                    width: 40,
                    decoration: const BoxDecoration(
                      color: AppColors.slate100,
                      borderRadius: AppRadius.full,
                    ),
                    child: const Center(
                      child: Icon(
                        LucideIcons.doorOpen,
                        color: AppColors.slate600,
                        size: 18,
                      ),
                    ),
                  ),
                  const SizedBox(width: 12),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          'Puerta ${user.gate ?? "—"}',
                          style: GoogleFonts.inter(
                            fontSize: 15,
                            fontWeight: FontWeight.w600,
                            color: AppColors.slate900,
                          ),
                        ),
                        const SizedBox(height: 1),
                        Text(
                          user.gate != null
                              ? 'Entrada y Salida Activa'
                              : 'Sin puerta asignada',
                          style: GoogleFonts.inter(
                            fontSize: 13,
                            color: AppColors.slate400,
                          ),
                        ),
                      ],
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 16),
              Container(
                padding: const EdgeInsets.symmetric(
                  horizontal: 14,
                  vertical: 12,
                ),
                decoration: const BoxDecoration(
                  color: AppColors.slate50,
                  borderRadius: AppRadius.lg,
                ),
                child: Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Text(
                      'Estado',
                      style: GoogleFonts.inter(
                        fontSize: 13,
                        color: AppColors.slate400,
                        fontWeight: FontWeight.w500,
                      ),
                    ),
                    Row(
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        Container(
                          width: 6,
                          height: 6,
                          decoration: const BoxDecoration(
                            color: AppColors.success,
                            shape: BoxShape.circle,
                          ),
                        ),
                        const SizedBox(width: 6),
                        Text(
                          'Activa',
                          style: GoogleFonts.inter(
                            fontSize: 12,
                            fontWeight: FontWeight.w600,
                            color: AppColors.success,
                          ),
                        ),
                      ],
                    ),
                  ],
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}

// ── _InfoRow
class _InfoRow extends StatelessWidget {
  final String label;
  final String? value;
  final Widget? valueWidget;

  const _InfoRow({required this.label, this.value, this.valueWidget});

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 11),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Text(
            label,
            style: GoogleFonts.inter(
              fontSize: 12,
              color: AppColors.slate400,
              fontWeight: FontWeight.w500,
            ),
          ),
          valueWidget ??
              Text(
                value ?? '',
                style: GoogleFonts.inter(
                  fontSize: 12,
                  fontWeight: FontWeight.w600,
                  color: AppColors.slate700,
                ),
              ),
        ],
      ),
    );
  }
}

// ── Admin Modal
class _AdminModal extends StatefulWidget {
  const _AdminModal();
  @override
  State<_AdminModal> createState() => _AdminModalState();
}

class _AdminModalState extends State<_AdminModal> {
  List<Guard> guards = [];
  bool loading = true;
  int? deletingId;

  @override
  void initState() {
    super.initState();
    _fetchGuards();
  }

  Future<void> _fetchGuards() async {
    setState(() => loading = true);
    try {
      final res = await ApiClient.get('/api/admin/guards');
      if (res.statusCode == 200) {
        final List data = jsonDecode(res.body);
        setState(() {
          guards = data.map((g) => Guard.fromJson(g)).toList();
        });
      }
    } catch (_) {
    } finally {
      setState(() => loading = false);
    }
  }

  Future<void> _deleteGuard(int id) async {
    final confirm = await showDialog<bool>(
      context: context,
      builder: (ctx) => AlertDialog(
        title: const Text('Confirmar eliminación'),
        content: const Text(
          '¿Eliminar este guardia? Esta acción no se puede deshacer.',
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(ctx, false),
            child: const Text('Cancelar'),
          ),
          TextButton(
            onPressed: () => Navigator.pop(ctx, true),
            style: TextButton.styleFrom(foregroundColor: AppColors.error),
            child: const Text('Eliminar'),
          ),
        ],
      ),
    );
    if (confirm != true) return;

    setState(() => deletingId = id);
    try {
      final res = await ApiClient.delete('/api/admin/guards/$id');
      if (res.statusCode == 200 || res.statusCode == 204) {
        setState(() => guards.removeWhere((g) => g.id == id));
      }
    } finally {
      setState(() => deletingId = null);
    }
  }

  void _showAddEditGuardModal({Guard? guard}) {
    showDialog(
      context: context,
      builder: (ctx) => _AddEditGuardForm(guard: guard, onSaved: _fetchGuards),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Dialog(
      child: ConstrainedBox(
        constraints: BoxConstraints(
          maxWidth: 400,
          maxHeight: MediaQuery.of(context).size.height * 0.8,
        ),
        child: Padding(
          padding: const EdgeInsets.all(20),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              // Header
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        'Gestión de guardias',
                        style: GoogleFonts.inter(
                          fontSize: 15,
                          fontWeight: FontWeight.w600,
                          color: AppColors.slate900,
                        ),
                      ),
                      Text(
                        'Administra el acceso del personal',
                        style: GoogleFonts.inter(
                          fontSize: 12,
                          color: AppColors.slate400,
                        ),
                      ),
                    ],
                  ),
                  IconButton(
                    icon: const Icon(LucideIcons.x, size: 16),
                    onPressed: () => Navigator.pop(context),
                    style: IconButton.styleFrom(
                      foregroundColor: AppColors.slate400,
                    ),
                  ),
                ],
              ),

              const SizedBox(height: 16),

              PrimaryButton(
                text: 'Agregar guardia',
                icon: LucideIcons.plus,
                onPressed: () => _showAddEditGuardModal(),
              ),

              const SizedBox(height: 12),

              if (loading)
                const Padding(
                  padding: EdgeInsets.all(32),
                  child: Center(child: CircularProgressIndicator()),
                )
              else if (guards.isEmpty)
                Container(
                  padding: const EdgeInsets.all(24),
                  decoration: BoxDecoration(
                    color: AppColors.slate50,
                    borderRadius: AppRadius.md,
                    border: Border.all(color: AppColors.slate200),
                  ),
                  child: Column(
                    children: [
                      const Icon(
                        LucideIcons.users,
                        size: 32,
                        color: AppColors.slate300,
                      ),
                      const SizedBox(height: 8),
                      Text(
                        'Sin guardias registrados',
                        style: GoogleFonts.inter(
                          fontSize: 13,
                          color: AppColors.slate400,
                        ),
                      ),
                    ],
                  ),
                )
              else
                Flexible(
                  child: ListView.separated(
                    shrinkWrap: true,
                    itemCount: guards.length,
                    separatorBuilder: (_, __) => const SizedBox(height: 8),
                    itemBuilder: (ctx, i) {
                      final g = guards[i];
                      return Container(
                        padding: const EdgeInsets.symmetric(
                          horizontal: 14,
                          vertical: 12,
                        ),
                        decoration: BoxDecoration(
                          color: AppColors.white,
                          border: Border.all(color: AppColors.slate200),
                          borderRadius: AppRadius.md,
                        ),
                        child: Row(
                          children: [
                            Container(
                              height: 36,
                              width: 36,
                              decoration: const BoxDecoration(
                                color: AppColors.slate100,
                                borderRadius: AppRadius.md,
                              ),
                              child: Center(
                                child: Text(
                                  g.fullName.isNotEmpty
                                      ? g.fullName[0].toUpperCase()
                                      : '?',
                                  style: GoogleFonts.inter(
                                    fontSize: 14,
                                    fontWeight: FontWeight.w700,
                                    color: AppColors.slate600,
                                  ),
                                ),
                              ),
                            ),
                            const SizedBox(width: 12),
                            Expanded(
                              child: Column(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  Text(
                                    g.fullName,
                                    style: GoogleFonts.inter(
                                      fontSize: 13,
                                      fontWeight: FontWeight.w600,
                                      color: AppColors.slate900,
                                    ),
                                    maxLines: 1,
                                    overflow: TextOverflow.ellipsis,
                                  ),
                                  Text(
                                    [
                                      g.email,
                                      if (g.gate != null) 'Puerta ${g.gate}',
                                      if (g.locationName != null)
                                        g.locationName!,
                                    ].join(' · '),
                                    style: GoogleFonts.inter(
                                      fontSize: 11,
                                      color: AppColors.slate400,
                                    ),
                                    maxLines: 1,
                                    overflow: TextOverflow.ellipsis,
                                  ),
                                ],
                              ),
                            ),
                            Row(
                              mainAxisSize: MainAxisSize.min,
                              children: [
                                IconButton(
                                  icon: const Icon(
                                    LucideIcons.pencil,
                                    size: 14,
                                  ),
                                  onPressed: () =>
                                      _showAddEditGuardModal(guard: g),
                                  style: IconButton.styleFrom(
                                    foregroundColor: AppColors.slate500,
                                  ),
                                  padding: EdgeInsets.zero,
                                  constraints: const BoxConstraints(
                                    minWidth: 32,
                                    minHeight: 32,
                                  ),
                                ),
                                IconButton(
                                  icon: const Icon(LucideIcons.list, size: 14),
                                  onPressed: () {
                                    Navigator.pop(context);
                                    context.push('/admin/guards/${g.id}');
                                  },
                                  style: IconButton.styleFrom(
                                    foregroundColor: AppColors.slate500,
                                  ),
                                  padding: EdgeInsets.zero,
                                  constraints: const BoxConstraints(
                                    minWidth: 32,
                                    minHeight: 32,
                                  ),
                                ),
                                IconButton(
                                  icon: const Icon(
                                    LucideIcons.trash2,
                                    size: 14,
                                  ),
                                  onPressed: deletingId == g.id
                                      ? null
                                      : () => _deleteGuard(g.id),
                                  style: IconButton.styleFrom(
                                    foregroundColor: AppColors.error,
                                  ),
                                  padding: EdgeInsets.zero,
                                  constraints: const BoxConstraints(
                                    minWidth: 32,
                                    minHeight: 32,
                                  ),
                                ),
                              ],
                            ),
                          ],
                        ),
                      );
                    },
                  ),
                ),
            ],
          ),
        ),
      ),
    );
  }
}

// ── Add/Edit guard form
class _AddEditGuardForm extends StatefulWidget {
  final Guard? guard;
  final VoidCallback onSaved;
  const _AddEditGuardForm({this.guard, required this.onSaved});
  @override
  State<_AddEditGuardForm> createState() => _AddEditGuardFormState();
}

class _AddEditGuardFormState extends State<_AddEditGuardForm> {
  final _emailCtrl = TextEditingController();
  final _pwdCtrl = TextEditingController();
  final _nameCtrl = TextEditingController();
  final _gateCtrl = TextEditingController(text: '1');
  String _locName = '';
  bool _submitting = false;
  String _error = '';

  @override
  void initState() {
    super.initState();
    if (widget.guard != null) {
      _emailCtrl.text = widget.guard!.email;
      _nameCtrl.text = widget.guard!.fullName;
      _gateCtrl.text = widget.guard!.gate?.toString() ?? '1';
      _locName = widget.guard!.locationName ?? '';
    } else {
      _locName = appLocations.isNotEmpty ? appLocations.first.name : '';
    }
  }

  void _onLocChange(String? val) {
    if (val == null) return;
    setState(() {
      _locName = val;
      final maxG = getMaxGatesForLocationName(val);
      final cVal = int.tryParse(_gateCtrl.text) ?? 1;
      _gateCtrl.text = cVal.clamp(1, maxG).toString();
    });
  }

  Future<void> _save() async {
    setState(() {
      _error = '';
      _submitting = true;
    });
    try {
      final body = {
        'email': _emailCtrl.text.trim(),
        'fullName': _nameCtrl.text.trim(),
        'gate': int.tryParse(_gateCtrl.text) ?? 1,
        'locationName': _locName.trim().isEmpty ? null : _locName.trim(),
      };
      if (widget.guard == null) body['password'] = _pwdCtrl.text;

      final res = widget.guard == null
          ? await ApiClient.post('/api/admin/guards', body: jsonEncode(body))
          : await ApiClient.put(
              '/api/admin/guards/${widget.guard!.id}',
              body: jsonEncode(body),
            );

      if (res.statusCode == 200 || res.statusCode == 201) {
        widget.onSaved();
        if (mounted) Navigator.pop(context);
      } else {
        final d = jsonDecode(res.body);
        setState(() => _error = d['error'] ?? 'Error desconocido');
      }
    } catch (_) {
      setState(() => _error = 'Error de conexión');
    } finally {
      if (mounted) setState(() => _submitting = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    final maxG = getMaxGatesForLocationName(_locName);
    final isEditing = widget.guard != null;

    return Dialog(
      child: ConstrainedBox(
        constraints: const BoxConstraints(maxWidth: 380),
        child: SingleChildScrollView(
          padding: const EdgeInsets.all(20),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Text(
                    isEditing ? 'Editar guardia' : 'Nuevo guardia',
                    style: GoogleFonts.inter(
                      fontSize: 15,
                      fontWeight: FontWeight.w600,
                      color: AppColors.slate900,
                    ),
                  ),
                  IconButton(
                    icon: const Icon(LucideIcons.x, size: 16),
                    onPressed: () => Navigator.pop(context),
                    style: IconButton.styleFrom(
                      foregroundColor: AppColors.slate400,
                    ),
                  ),
                ],
              ),

              const SizedBox(height: 16),

              CustomTextField(
                label: 'Nombre completo',
                hint: 'Juan Rodríguez',
                controller: _nameCtrl,
                prefixIcon: LucideIcons.user,
              ),
              const SizedBox(height: 12),
              CustomTextField(
                label: 'Correo electrónico',
                hint: 'guardia@buap.mx',
                controller: _emailCtrl,
                keyboardType: TextInputType.emailAddress,
                prefixIcon: LucideIcons.mail,
              ),
              const SizedBox(height: 12),

              if (!isEditing) ...[
                CustomTextField(
                  label: 'Contraseña',
                  hint: 'Contraseña segura',
                  controller: _pwdCtrl,
                  isPassword: true,
                  prefixIcon: LucideIcons.lock,
                ),
                const SizedBox(height: 12),
              ],

              // Plantel dropdown
              Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    'Plantel',
                    style: GoogleFonts.inter(
                      fontSize: 12,
                      fontWeight: FontWeight.w500,
                      color: AppColors.slate600,
                      letterSpacing: 0.1,
                    ),
                  ),
                  const SizedBox(height: 6),
                  Container(
                    padding: const EdgeInsets.symmetric(horizontal: 12),
                    decoration: BoxDecoration(
                      color: AppColors.slate50,
                      border: Border.all(color: AppColors.slate200),
                      borderRadius: AppRadius.md,
                    ),
                    child: DropdownButtonHideUnderline(
                      child: DropdownButton<String>(
                        value: _locName.isEmpty ? null : _locName,
                        isExpanded: true,
                        hint: Text(
                          'Sin plantel asignado',
                          style: GoogleFonts.inter(
                            fontSize: 14,
                            color: AppColors.slate400,
                          ),
                        ),
                        style: GoogleFonts.inter(
                          fontSize: 14,
                          color: AppColors.slate900,
                        ),
                        items: [
                          DropdownMenuItem(
                            value: '',
                            child: Text(
                              'Sin plantel asignado',
                              style: GoogleFonts.inter(
                                fontSize: 14,
                                color: AppColors.slate400,
                              ),
                            ),
                          ),
                          ...appLocations.map(
                            (l) => DropdownMenuItem(
                              value: l.name,
                              child: Text(l.name),
                            ),
                          ),
                        ],
                        onChanged: _onLocChange,
                      ),
                    ),
                  ),
                ],
              ),

              const SizedBox(height: 12),
              CustomTextField(
                label: 'Puerta (1 – $maxG)',
                hint: '1',
                controller: _gateCtrl,
                keyboardType: TextInputType.number,
                prefixIcon: LucideIcons.doorOpen,
              ),

              if (_error.isNotEmpty) ...[
                const SizedBox(height: 12),
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

              const SizedBox(height: 20),

              Row(
                children: [
                  Expanded(
                    child: OutlinedButton(
                      onPressed: () => Navigator.pop(context),
                      child: const Text('Cancelar'),
                    ),
                  ),
                  const SizedBox(width: 10),
                  Expanded(
                    child: PrimaryButton(
                      text: isEditing ? 'Guardar' : 'Crear',
                      onPressed: _save,
                      isLoading: _submitting,
                    ),
                  ),
                ],
              ),
            ],
          ),
        ),
      ),
    );
  }
}
