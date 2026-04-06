import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../configuracion/theme.dart';
import '../../servicios/auth_service.dart';
import '../../servicios/admin_service.dart';
import '../../servicios/api_service.dart';

class InventarioScreen extends StatefulWidget {
  const InventarioScreen({super.key});

  @override
  State<InventarioScreen> createState() => _InventarioScreenState();
}

class _InventarioScreenState extends State<InventarioScreen> {
  List<dynamic> _destinos = [];
  bool _loading = true;
  String _search = '';
  String _filtroEstado = 'Todos';

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
      _destinos = panel['destinos'] ?? [];
    } catch (_) {}
    if (mounted) setState(() => _loading = false);
  }

  List<dynamic> get _filtrados {
    var list = List<dynamic>.from(_destinos);
    if (_filtroEstado == 'Activos') {
      list = list.where((d) => d['activo'] == true).toList();
    } else if (_filtroEstado == 'Inactivos') {
      list = list.where((d) => d['activo'] != true).toList();
    }
    if (_search.isNotEmpty) {
      final q = _search.toLowerCase();
      list = list.where((d) {
        return (d['nombre'] ?? '').toString().toLowerCase().contains(q) ||
            (d['ciudad'] ?? '').toString().toLowerCase().contains(q) ||
            (d['pais'] ?? '').toString().toLowerCase().contains(q);
      }).toList();
    }
    return list;
  }

  void _showForm([Map<String, dynamic>? existing]) {
    final isEdit = existing != null;
    final nombreC = TextEditingController(text: existing?['nombre'] ?? '');
    final paisC = TextEditingController(text: existing?['pais'] ?? 'Colombia');
    final ciudadC = TextEditingController(text: existing?['ciudad'] ?? '');
    final descC = TextEditingController(text: existing?['descripcion'] ?? '');
    final precioC = TextEditingController(
        text: existing?['precio']?.toString() ?? '');
    bool activo = existing?['activo'] ?? true;

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
                  isEdit ? 'Editar Destino' : 'Nuevo Destino',
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
                  controller: paisC,
                  decoration: const InputDecoration(labelText: 'País'),
                ),
                const SizedBox(height: 10),
                TextField(
                  controller: ciudadC,
                  decoration: const InputDecoration(labelText: 'Ciudad'),
                ),
                const SizedBox(height: 10),
                TextField(
                  controller: descC,
                  maxLines: 3,
                  decoration: const InputDecoration(labelText: 'Descripción'),
                ),
                const SizedBox(height: 10),
                TextField(
                  controller: precioC,
                  keyboardType: TextInputType.number,
                  decoration: const InputDecoration(labelText: 'Precio (COP)'),
                ),
                const SizedBox(height: 10),
                SwitchListTile(
                  title: const Text('Activo'),
                  value: activo,
                  activeColor: AppTheme.primaryColor,
                  onChanged: (v) => setLocal(() => activo = v),
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
                          final data = {
                            'nombre': nombreC.text.trim(),
                            'pais': paisC.text.trim(),
                            'ciudad': ciudadC.text.trim(),
                            'descripcion': descC.text.trim(),
                            'precio':
                                double.tryParse(precioC.text) ?? 0,
                            'activo': activo,
                          };
                          Navigator.pop(ctx);
                          try {
                            if (isEdit) {
                              await AdminService.actualizarDestino(
                                  existing['id'].toString(), data);
                            } else {
                              await AdminService.crearDestino(data);
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

  Future<void> _delete(dynamic destino) async {
    final confirm = await showDialog<bool>(
      context: context,
      builder: (ctx) => AlertDialog(
        title: const Text('Eliminar destino'),
        content: Text('¿Eliminar "${destino['nombre']}"?'),
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
      await AdminService.eliminarDestino(destino['id'].toString());
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
      appBar: AppBar(title: const Text('Inventario')),
      floatingActionButton: FloatingActionButton(
        onPressed: () => _showForm(),
        child: const Icon(Icons.add),
      ),
      body: Column(
        children: [
          // Búsqueda y filtro
          Padding(
            padding: const EdgeInsets.fromLTRB(16, 12, 16, 0),
            child: TextField(
              onChanged: (v) => setState(() => _search = v),
              decoration: const InputDecoration(
                hintText: 'Buscar destinos...',
                prefixIcon: Icon(Icons.search),
              ),
            ),
          ),
          SizedBox(
            height: 50,
            child: ListView(
              scrollDirection: Axis.horizontal,
              padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
              children: ['Todos', 'Activos', 'Inactivos'].map((f) {
                final active = f == _filtroEstado;
                return Padding(
                  padding: const EdgeInsets.symmetric(horizontal: 4),
                  child: ChoiceChip(
                    label: Text(f),
                    selected: active,
                    selectedColor: AppTheme.primaryColor,
                    labelStyle: TextStyle(
                      color: active ? Colors.white : AppTheme.textPrimary,
                    ),
                    onSelected: (_) => setState(() => _filtroEstado = f),
                  ),
                );
              }).toList(),
            ),
          ),

          // Lista
          Expanded(
            child: _loading
                ? const Center(child: CircularProgressIndicator())
                : _filtrados.isEmpty
                    ? const Center(child: Text('No hay destinos'))
                    : RefreshIndicator(
                        onRefresh: _load,
                        child: ListView.separated(
                          padding: const EdgeInsets.all(16),
                          itemCount: _filtrados.length,
                          separatorBuilder: (_, __) =>
                              const SizedBox(height: 8),
                          itemBuilder: (_, i) {
                            final d = _filtrados[i];
                            final activo = d['activo'] == true;
                            return Card(
                              child: ListTile(
                                leading: Icon(
                                  activo
                                      ? Icons.check_circle
                                      : Icons.cancel,
                                  color: activo
                                      ? AppTheme.successColor
                                      : AppTheme.dangerColor,
                                ),
                                title: Text(d['nombre'] ?? ''),
                                subtitle: Text(
                                  '${d['ciudad'] ?? ''}, ${d['pais'] ?? ''} • \$${d['precio'] ?? 0}',
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
                                    if (v == 'edit') _showForm(d);
                                    if (v == 'delete') _delete(d);
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
}
