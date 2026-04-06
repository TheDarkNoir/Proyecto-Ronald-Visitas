import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../configuracion/theme.dart';
import '../../servicios/auth_service.dart';
import '../../servicios/admin_service.dart';
import '../../servicios/api_service.dart';

class UsuariosScreen extends StatefulWidget {
  const UsuariosScreen({super.key});

  @override
  State<UsuariosScreen> createState() => _UsuariosScreenState();
}

class _UsuariosScreenState extends State<UsuariosScreen> {
  List<dynamic> _usuarios = [];
  bool _loading = true;
  String _search = '';
  String _filtroRol = 'Todos';

  @override
  void initState() {
    super.initState();
    _load();
  }

  Future<void> _load() async {
    final auth = context.read<AuthService>();
    setState(() => _loading = true);
    try {
      final panel = await AdminService.getPanel(auth.currentUser!.id);
      _usuarios = panel['usuarios'] ?? [];
    } catch (_) {}
    if (mounted) setState(() => _loading = false);
  }

  List<dynamic> get _filtrados {
    var list = List<dynamic>.from(_usuarios);
    if (_filtroRol != 'Todos') {
      list = list
          .where((u) =>
              (u['rol'] ?? '').toString().toLowerCase() ==
              _filtroRol.toLowerCase())
          .toList();
    }
    if (_search.isNotEmpty) {
      final q = _search.toLowerCase();
      list = list.where((u) {
        return (u['nombre'] ?? '').toString().toLowerCase().contains(q) ||
            (u['email'] ?? '').toString().toLowerCase().contains(q);
      }).toList();
    }
    return list;
  }

  void _showForm([Map<String, dynamic>? existing]) {
    final isEdit = existing != null;
    final nombreC = TextEditingController(text: existing?['nombre'] ?? '');
    final emailC = TextEditingController(text: existing?['email'] ?? '');
    final passC = TextEditingController();
    String rol = existing?['rol'] ?? 'cliente';

    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(20)),
      ),
      builder: (ctx) => StatefulBuilder(
        builder: (ctx, setLocal) => Padding(
          padding: EdgeInsets.only(
            left: 20,
            right: 20,
            top: 20,
            bottom: MediaQuery.of(ctx).viewInsets.bottom + 20,
          ),
          child: SingleChildScrollView(
            child: Column(
              mainAxisSize: MainAxisSize.min,
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  isEdit ? 'Editar Usuario' : 'Nuevo Usuario',
                  style: const TextStyle(
                      fontSize: 20, fontWeight: FontWeight.bold),
                ),
                const SizedBox(height: 16),
                TextField(
                  controller: nombreC,
                  decoration: const InputDecoration(labelText: 'Nombre'),
                ),
                const SizedBox(height: 10),
                TextField(
                  controller: emailC,
                  keyboardType: TextInputType.emailAddress,
                  readOnly: isEdit,
                  decoration: const InputDecoration(labelText: 'Email'),
                ),
                const SizedBox(height: 10),
                if (!isEdit) ...[
                  TextField(
                    controller: passC,
                    obscureText: true,
                    decoration: const InputDecoration(labelText: 'Contraseña'),
                  ),
                  const SizedBox(height: 10),
                ],
                DropdownButtonFormField<String>(
                  value: rol,
                  decoration: const InputDecoration(labelText: 'Rol'),
                  items: const [
                    DropdownMenuItem(value: 'cliente', child: Text('Cliente')),
                    DropdownMenuItem(value: 'admin', child: Text('Admin')),
                  ],
                  onChanged: (v) => setLocal(() => rol = v ?? 'cliente'),
                ),
                const SizedBox(height: 16),
                Row(
                  children: [
                    Expanded(
                      child: OutlinedButton(
                        onPressed: () => Navigator.pop(ctx),
                        child: const Text('Cancelar'),
                      ),
                    ),
                    const SizedBox(width: 12),
                    Expanded(
                      child: ElevatedButton(
                        onPressed: () async {
                          final data = <String, dynamic>{
                            'nombre': nombreC.text.trim(),
                            'email': emailC.text.trim(),
                            'rol': rol,
                          };
                          if (!isEdit && passC.text.isNotEmpty) {
                            data['password'] = passC.text;
                          }
                          Navigator.pop(ctx);
                          try {
                            if (isEdit) {
                              await AdminService.actualizarUsuario(
                                  existing['id'].toString(), data);
                            } else {
                              await AdminService.crearUsuario(data);
                            }
                            _load();
                          } on ApiException catch (e) {
                            if (mounted) {
                              ScaffoldMessenger.of(context).showSnackBar(
                                SnackBar(content: Text(e.message)),
                              );
                            }
                          }
                        },
                        child: Text(isEdit ? 'Guardar' : 'Crear'),
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

  Future<void> _delete(dynamic user) async {
    final confirm = await showDialog<bool>(
      context: context,
      builder: (ctx) => AlertDialog(
        title: const Text('Eliminar usuario'),
        content: Text('¿Eliminar "${user['nombre']}"?'),
        actions: [
          TextButton(
              onPressed: () => Navigator.pop(ctx, false),
              child: const Text('No')),
          ElevatedButton(
            onPressed: () => Navigator.pop(ctx, true),
            style: ElevatedButton.styleFrom(backgroundColor: AppTheme.dangerColor),
            child: const Text('Eliminar'),
          ),
        ],
      ),
    );
    if (confirm != true) return;

    try {
      await AdminService.eliminarUsuario(user['id'].toString());
      _load();
    } on ApiException catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context)
            .showSnackBar(SnackBar(content: Text(e.message)));
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Usuarios')),
      floatingActionButton: FloatingActionButton(
        onPressed: () => _showForm(),
        child: const Icon(Icons.person_add),
      ),
      body: Column(
        children: [
          Padding(
            padding: const EdgeInsets.fromLTRB(16, 12, 16, 0),
            child: TextField(
              onChanged: (v) => setState(() => _search = v),
              decoration: const InputDecoration(
                hintText: 'Buscar usuarios...',
                prefixIcon: Icon(Icons.search),
              ),
            ),
          ),
          SizedBox(
            height: 50,
            child: ListView(
              scrollDirection: Axis.horizontal,
              padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
              children: ['Todos', 'cliente', 'admin'].map((f) {
                final active = f == _filtroRol;
                return Padding(
                  padding: const EdgeInsets.symmetric(horizontal: 4),
                  child: ChoiceChip(
                    label: Text(f == 'Todos' ? 'Todos' : f.toUpperCase()),
                    selected: active,
                    selectedColor: AppTheme.primaryColor,
                    labelStyle: TextStyle(
                      color: active ? Colors.white : AppTheme.textPrimary,
                    ),
                    onSelected: (_) => setState(() => _filtroRol = f),
                  ),
                );
              }).toList(),
            ),
          ),
          Expanded(
            child: _loading
                ? const Center(child: CircularProgressIndicator())
                : _filtrados.isEmpty
                    ? const Center(child: Text('No hay usuarios'))
                    : RefreshIndicator(
                        onRefresh: _load,
                        child: ListView.separated(
                          padding: const EdgeInsets.all(16),
                          itemCount: _filtrados.length,
                          separatorBuilder: (_, __) =>
                              const SizedBox(height: 8),
                          itemBuilder: (_, i) {
                            final u = _filtrados[i];
                            final isAdmin =
                                (u['rol'] ?? '').toString().toLowerCase() ==
                                    'admin';
                            return Card(
                              child: ListTile(
                                leading: CircleAvatar(
                                  backgroundColor: isAdmin
                                      ? AppTheme.accentColor
                                      : AppTheme.primaryColor,
                                  child: Text(
                                    _initials(u['nombre'] ?? ''),
                                    style: const TextStyle(
                                        color: Colors.white, fontSize: 14),
                                  ),
                                ),
                                title: Text(u['nombre'] ?? ''),
                                subtitle: Text(
                                  '${u['email'] ?? ''} • ${(u['rol'] ?? '').toString().toUpperCase()}',
                                ),
                                trailing: PopupMenuButton(
                                  itemBuilder: (_) => [
                                    const PopupMenuItem(
                                      value: 'edit',
                                      child: Text('Editar'),
                                    ),
                                    const PopupMenuItem(
                                      value: 'delete',
                                      child: Text('Eliminar',
                                          style:
                                              TextStyle(color: Colors.red)),
                                    ),
                                  ],
                                  onSelected: (v) {
                                    if (v == 'edit') {
                                      _showForm(
                                          Map<String, dynamic>.from(u));
                                    }
                                    if (v == 'delete') _delete(u);
                                  },
                                ),
                              ),
                            );
                          },
                        ),
                      ),
          ),
        ],
      ),
    );
  }

  String _initials(String name) {
    final parts = name.split(' ');
    if (parts.length >= 2) {
      return '${parts[0][0]}${parts[1][0]}'.toUpperCase();
    }
    return name.isNotEmpty ? name[0].toUpperCase() : 'U';
  }
}
