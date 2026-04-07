import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../configuracion/theme.dart';
import '../../modelos/user.dart';
import '../../servicios/auth_service.dart';
import '../../servicios/perfil_service.dart';
import '../../servicios/api_service.dart';

class PerfilScreen extends StatefulWidget {
  const PerfilScreen({super.key});

  @override
  State<PerfilScreen> createState() => _PerfilScreenState();
}

class _PerfilScreenState extends State<PerfilScreen>
    with SingleTickerProviderStateMixin {
  late TabController _tabCtrl;
  final _nombreCtrl = TextEditingController();
  final _telefonoCtrl = TextEditingController();
  final _ciudadCtrl = TextEditingController();
  final _fechaCtrl = TextEditingController();
  String _pais = 'Colombia';
  String _email = '';
  bool _loading = true;
  bool _saving = false;

  final _currentPassCtrl = TextEditingController();
  final _newPassCtrl = TextEditingController();
  final _confirmPassCtrl = TextEditingController();
  bool _changingPassword = false;

  final _paises = [
    'Colombia',
    'México',
    'Argentina',
    'Chile',
    'Perú',
    'Ecuador',
    'Venezuela',
    'Brasil',
    'España',
    'Estados Unidos',
  ];

  @override
  void initState() {
    super.initState();
    _tabCtrl = TabController(length: 3, vsync: this);
    _loadPerfil();
  }

  @override
  void dispose() {
    _tabCtrl.dispose();
    _nombreCtrl.dispose();
    _telefonoCtrl.dispose();
    _ciudadCtrl.dispose();
    _fechaCtrl.dispose();
    _currentPassCtrl.dispose();
    _newPassCtrl.dispose();
    _confirmPassCtrl.dispose();
    super.dispose();
  }

  Future<void> _loadPerfil() async {
    final auth = context.read<AuthService>();
    if (auth.currentUser == null) return;

    try {
      final user = await PerfilService.getPerfil(auth.currentUser!.id);
      _populateForm(user);
    } catch (_) {
      _populateForm(auth.currentUser!);
    }
    if (mounted) setState(() => _loading = false);
  }

  void _populateForm(User user) {
    _nombreCtrl.text = user.nombre;
    _email = user.email;
    _telefonoCtrl.text = user.telefono ?? '';
    _ciudadCtrl.text = user.ciudad ?? '';
    _fechaCtrl.text = user.fechaNacimiento?.substring(0, 10) ?? '';
    if (user.pais != null && _paises.contains(user.pais)) {
      _pais = user.pais!;
    }
  }

  Future<void> _pickDate() async {
    final now = DateTime.now();
    final picked = await showDatePicker(
      context: context,
      initialDate: DateTime(2000),
      firstDate: DateTime(1930),
      lastDate: now,
    );
    if (picked != null) {
      _fechaCtrl.text =
          '${picked.year}-${picked.month.toString().padLeft(2, '0')}-${picked.day.toString().padLeft(2, '0')}';
    }
  }

  Future<void> _save() async {
    final nombre = _nombreCtrl.text.trim();
    if (nombre.isEmpty) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('El nombre no puede estar vacío')),
      );
      return;
    }

    final auth = context.read<AuthService>();
    setState(() => _saving = true);

    try {
      final updated = await PerfilService.updatePerfil(
        userId: auth.currentUser!.id,
        nombre: nombre,
        telefono: _telefonoCtrl.text,
        pais: _pais,
        ciudad: _ciudadCtrl.text,
        fechaNacimiento: _fechaCtrl.text.isEmpty ? null : _fechaCtrl.text,
      );
      auth.updateUser(updated);
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text('Perfil actualizado'),
          backgroundColor: AppTheme.successColor,
        ),
      );
    } on ApiException catch (e) {
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text(e.message),
          backgroundColor: AppTheme.dangerColor,
        ),
      );
    } finally {
      if (mounted) setState(() => _saving = false);
    }
  }

  Future<void> _changePassword() async {
    final current = _currentPassCtrl.text;
    final newPass = _newPassCtrl.text;
    final confirm = _confirmPassCtrl.text;

    if (current.isEmpty || newPass.isEmpty || confirm.isEmpty) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text('Completa todos los campos de contraseña'),
        ),
      );
      return;
    }
    if (newPass.length < 8) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text('La nueva contraseña debe tener al menos 8 caracteres'),
        ),
      );
      return;
    }
    if (newPass != confirm) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Las contraseñas no coinciden')),
      );
      return;
    }

    final auth = context.read<AuthService>();
    setState(() => _changingPassword = true);
    try {
      await ApiService.put('/perfil/${auth.currentUser!.id}/password', {
        'currentPassword': current,
        'newPassword': newPass,
      });
      _currentPassCtrl.clear();
      _newPassCtrl.clear();
      _confirmPassCtrl.clear();
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text('Contraseña actualizada correctamente'),
          backgroundColor: AppTheme.successColor,
        ),
      );
    } on ApiException catch (e) {
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text(e.message),
          backgroundColor: AppTheme.dangerColor,
        ),
      );
    } finally {
      if (mounted) setState(() => _changingPassword = false);
    }
  }

  Future<void> _logout() async {
    final authService = context.read<AuthService>();
    final confirm = await showDialog<bool>(
      context: context,
      builder: (ctx) => AlertDialog(
        title: const Text('Cerrar sesión'),
        content: const Text('¿Deseas cerrar sesión?'),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(ctx, false),
            child: const Text('No'),
          ),
          ElevatedButton(
            onPressed: () => Navigator.pop(ctx, true),
            child: const Text('Sí'),
          ),
        ],
      ),
    );
    if (confirm == true) {
      await authService.logout();
    }
  }

  @override
  Widget build(BuildContext context) {
    final auth = context.watch<AuthService>();
    final user = auth.currentUser;

    return Scaffold(
      appBar: AppBar(
        title: const Text('Mi Perfil'),
        actions: [
          IconButton(
            icon: const Icon(Icons.logout),
            onPressed: _logout,
            tooltip: 'Cerrar sesión',
          ),
        ],
        bottom: TabBar(
          controller: _tabCtrl,
          indicatorColor: Colors.white,
          tabs: const [
            Tab(text: 'Información'),
            Tab(text: 'Preferencias'),
            Tab(text: 'Seguridad'),
          ],
        ),
      ),
      body: _loading
          ? const Center(child: CircularProgressIndicator())
          : TabBarView(
              controller: _tabCtrl,
              children: [
                // Tab 1: Info personal
                SingleChildScrollView(
                  padding: const EdgeInsets.all(20),
                  child: Column(
                    children: [
                      // Avatar
                      CircleAvatar(
                        radius: 40,
                        backgroundColor: AppTheme.primaryColor,
                        child: Text(
                          user?.initials ?? 'U',
                          style: const TextStyle(
                            fontSize: 28,
                            color: Colors.white,
                            fontWeight: FontWeight.bold,
                          ),
                        ),
                      ),
                      const SizedBox(height: 8),
                      Text(
                        user?.nombre ?? '',
                        style: const TextStyle(
                          fontSize: 18,
                          fontWeight: FontWeight.bold,
                        ),
                      ),
                      Text(
                        _email,
                        style: const TextStyle(
                          color: AppTheme.textSecondary,
                          fontSize: 14,
                        ),
                      ),
                      const SizedBox(height: 24),

                      TextFormField(
                        controller: _nombreCtrl,
                        decoration: const InputDecoration(
                          labelText: 'Nombre',
                          prefixIcon: Icon(Icons.person_outlined),
                        ),
                      ),
                      const SizedBox(height: 14),
                      TextFormField(
                        initialValue: _email,
                        readOnly: true,
                        decoration: const InputDecoration(
                          labelText: 'Email (no editable)',
                          prefixIcon: Icon(Icons.email_outlined),
                        ),
                      ),
                      const SizedBox(height: 14),
                      TextFormField(
                        controller: _telefonoCtrl,
                        keyboardType: TextInputType.phone,
                        decoration: const InputDecoration(
                          labelText: 'Teléfono',
                          prefixIcon: Icon(Icons.phone_outlined),
                        ),
                      ),
                      const SizedBox(height: 14),
                      DropdownButtonFormField<String>(
                        initialValue: _pais,
                        decoration: const InputDecoration(
                          labelText: 'País',
                          prefixIcon: Icon(Icons.public),
                        ),
                        items: _paises
                            .map(
                              (p) => DropdownMenuItem(value: p, child: Text(p)),
                            )
                            .toList(),
                        onChanged: (v) =>
                            setState(() => _pais = v ?? 'Colombia'),
                      ),
                      const SizedBox(height: 14),
                      TextFormField(
                        controller: _ciudadCtrl,
                        decoration: const InputDecoration(
                          labelText: 'Ciudad',
                          prefixIcon: Icon(Icons.location_city),
                        ),
                      ),
                      const SizedBox(height: 14),
                      TextFormField(
                        controller: _fechaCtrl,
                        readOnly: true,
                        onTap: _pickDate,
                        decoration: const InputDecoration(
                          labelText: 'Fecha de nacimiento',
                          prefixIcon: Icon(Icons.cake_outlined),
                          suffixIcon: Icon(Icons.calendar_today),
                        ),
                      ),
                      const SizedBox(height: 24),
                      SizedBox(
                        width: double.infinity,
                        child: ElevatedButton(
                          onPressed: _saving ? null : _save,
                          child: _saving
                              ? const SizedBox(
                                  height: 20,
                                  width: 20,
                                  child: CircularProgressIndicator(
                                    strokeWidth: 2,
                                    color: Colors.white,
                                  ),
                                )
                              : const Text('Guardar Cambios'),
                        ),
                      ),
                    ],
                  ),
                ),

                // Tab 2: Preferencias
                SingleChildScrollView(
                  padding: const EdgeInsets.all(20),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      const Text(
                        'Preferencias de viaje',
                        style: TextStyle(
                          fontSize: 18,
                          fontWeight: FontWeight.bold,
                        ),
                      ),
                      const SizedBox(height: 16),
                      _prefItem(Icons.beach_access, 'Playa'),
                      _prefItem(Icons.forest, 'Naturaleza'),
                      _prefItem(Icons.paragliding, 'Aventura'),
                      _prefItem(Icons.museum, 'Cultura'),
                      _prefItem(Icons.restaurant, 'Gastronomía'),
                      const SizedBox(height: 24),
                      const Text(
                        'Información de cuenta',
                        style: TextStyle(
                          fontSize: 18,
                          fontWeight: FontWeight.bold,
                        ),
                      ),
                      const SizedBox(height: 12),
                      ListTile(
                        leading: const Icon(Icons.badge),
                        title: const Text('Rol'),
                        subtitle: Text(user?.rol.toUpperCase() ?? 'CLIENTE'),
                      ),
                      ListTile(
                        leading: const Icon(Icons.calendar_month),
                        title: const Text('Miembro desde'),
                        subtitle: Text(
                          user?.createdAt?.substring(0, 10) ?? '-',
                        ),
                      ),
                    ],
                  ),
                ),

                // Tab 3: Seguridad
                SingleChildScrollView(
                  padding: const EdgeInsets.all(20),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      const Text(
                        'Cambiar contraseña',
                        style: TextStyle(
                          fontSize: 18,
                          fontWeight: FontWeight.bold,
                        ),
                      ),
                      const SizedBox(height: 6),
                      const Text(
                        'Actualiza tu contraseña para proteger tu cuenta',
                        style: TextStyle(
                          color: AppTheme.textSecondary,
                          fontSize: 13,
                        ),
                      ),
                      const SizedBox(height: 20),
                      TextFormField(
                        controller: _currentPassCtrl,
                        obscureText: true,
                        decoration: const InputDecoration(
                          labelText: 'Contraseña actual',
                          prefixIcon: Icon(Icons.lock_outline),
                        ),
                      ),
                      const SizedBox(height: 14),
                      TextFormField(
                        controller: _newPassCtrl,
                        obscureText: true,
                        decoration: const InputDecoration(
                          labelText: 'Nueva contraseña',
                          prefixIcon: Icon(Icons.lock_outlined),
                          helperText: 'Mínimo 8 caracteres',
                        ),
                      ),
                      const SizedBox(height: 14),
                      TextFormField(
                        controller: _confirmPassCtrl,
                        obscureText: true,
                        decoration: const InputDecoration(
                          labelText: 'Confirmar contraseña',
                          prefixIcon: Icon(Icons.lock_outlined),
                        ),
                      ),
                      const SizedBox(height: 24),
                      SizedBox(
                        width: double.infinity,
                        child: ElevatedButton(
                          onPressed: _changingPassword ? null : _changePassword,
                          child: _changingPassword
                              ? const SizedBox(
                                  height: 20,
                                  width: 20,
                                  child: CircularProgressIndicator(
                                    strokeWidth: 2,
                                    color: Colors.white,
                                  ),
                                )
                              : const Text('Actualizar Contraseña'),
                        ),
                      ),
                      const SizedBox(height: 40),
                      const Divider(),
                      const SizedBox(height: 16),
                      const Text(
                        'Zona peligrosa',
                        style: TextStyle(
                          fontSize: 16,
                          fontWeight: FontWeight.bold,
                          color: AppTheme.dangerColor,
                        ),
                      ),
                      const SizedBox(height: 8),
                      const Text(
                        'Eliminar tu cuenta es irreversible. Se programará la eliminación para 7 días.',
                        style: TextStyle(
                          fontSize: 13,
                          color: AppTheme.textSecondary,
                        ),
                      ),
                      const SizedBox(height: 12),
                      SizedBox(
                        width: double.infinity,
                        child: OutlinedButton(
                          style: OutlinedButton.styleFrom(
                            foregroundColor: AppTheme.dangerColor,
                            side: const BorderSide(color: AppTheme.dangerColor),
                          ),
                          onPressed: () async {
                            final messenger = ScaffoldMessenger.of(context);
                            final ok = await showDialog<bool>(
                              context: context,
                              builder: (ctx) => AlertDialog(
                                title: const Text('Eliminar cuenta'),
                                content: const Text(
                                  '¿Estás seguro? Esta acción programará la eliminación de tu cuenta.',
                                ),
                                actions: [
                                  TextButton(
                                    onPressed: () => Navigator.pop(ctx, false),
                                    child: const Text('Cancelar'),
                                  ),
                                  ElevatedButton(
                                    style: ElevatedButton.styleFrom(
                                      backgroundColor: AppTheme.dangerColor,
                                    ),
                                    onPressed: () => Navigator.pop(ctx, true),
                                    child: const Text('Eliminar'),
                                  ),
                                ],
                              ),
                            );
                            if (ok == true && mounted) {
                              messenger.showSnackBar(
                                const SnackBar(
                                  content: Text(
                                    'Cuenta programada para eliminarse en 7 días',
                                  ),
                                ),
                              );
                            }
                          },
                          child: const Text('Eliminar Cuenta'),
                        ),
                      ),
                    ],
                  ),
                ),
              ],
            ),
    );
  }

  Widget _prefItem(IconData icon, String label) {
    return SwitchListTile(
      secondary: Icon(icon, color: AppTheme.primaryColor),
      title: Text(label),
      value: true,
      activeThumbColor: AppTheme.primaryColor,
      onChanged: (_) {},
    );
  }
}
