import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../configuracion/theme.dart';
import '../../servicios/auth_service.dart';
import '../../servicios/admin_service.dart';
import '../../servicios/api_service.dart';

class OperacionesScreen extends StatefulWidget {
  const OperacionesScreen({super.key});

  @override
  State<OperacionesScreen> createState() => _OperacionesScreenState();
}

class _OperacionesScreenState extends State<OperacionesScreen> {
  List<dynamic> _operaciones = [];
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
      _operaciones = panel['reservaciones'] ?? panel['operaciones'] ?? [];
    } catch (_) {}
    if (mounted) setState(() => _loading = false);
  }

  List<dynamic> get _filtrados {
    var list = List<dynamic>.from(_operaciones);
    if (_filtroEstado != 'Todos') {
      list = list.where((o) {
        final estado = (o['estado'] ?? '').toString().toLowerCase();
        final filtro = _filtroEstado.toLowerCase();
        return estado.contains(filtro);
      }).toList();
    }
    if (_search.isNotEmpty) {
      final q = _search.toLowerCase();
      list = list.where((o) {
        final usuario = o['Usuarios'] ?? o['usuario'] ?? {};
        final destino = o['Destinos'] ?? o['destino'] ?? {};
        return (usuario['nombre'] ?? '').toString().toLowerCase().contains(q) ||
            (usuario['email'] ?? '').toString().toLowerCase().contains(q) ||
            (destino['nombre'] ?? '').toString().toLowerCase().contains(q) ||
            (o['id'] ?? '').toString().toLowerCase().contains(q);
      }).toList();
    }
    return list;
  }

  Color _statusColor(String estado) {
    final e = estado.toLowerCase();
    if (e.contains('confirm')) return AppTheme.successColor;
    if (e.contains('cancel')) return AppTheme.dangerColor;
    return AppTheme.warningColor;
  }

  String _statusLabel(String estado) {
    final e = estado.toLowerCase();
    if (e.contains('confirm')) return 'Confirmada';
    if (e.contains('cancel')) return 'Cancelada';
    if (e.contains('pend')) return 'Pendiente';
    return estado;
  }

  Future<void> _changeStatus(dynamic op, String newStatus) async {
    try {
      await AdminService.cambiarEstadoReserva(op['id'].toString(), newStatus);
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
      appBar: AppBar(title: const Text('Operaciones')),
      body: Column(
        children: [
          Padding(
            padding: const EdgeInsets.fromLTRB(16, 12, 16, 0),
            child: TextField(
              onChanged: (v) => setState(() => _search = v),
              decoration: const InputDecoration(
                hintText: 'Buscar por usuario o destino...',
                prefixIcon: Icon(Icons.search),
              ),
            ),
          ),
          SizedBox(
            height: 50,
            child: ListView(
              scrollDirection: Axis.horizontal,
              padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
              children: ['Todos', 'Pendiente', 'Confirmada', 'Cancelada']
                  .map((f) {
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
          Expanded(
            child: _loading
                ? const Center(child: CircularProgressIndicator())
                : _filtrados.isEmpty
                    ? const Center(child: Text('No hay operaciones'))
                    : RefreshIndicator(
                        onRefresh: _load,
                        child: ListView.separated(
                          padding: const EdgeInsets.all(16),
                          itemCount: _filtrados.length,
                          separatorBuilder: (_, __) =>
                              const SizedBox(height: 8),
                          itemBuilder: (_, i) {
                            final o = _filtrados[i];
                            final usuario =
                                o['Usuarios'] ?? o['usuario'] ?? {};
                            final destino =
                                o['Destinos'] ?? o['destino'] ?? {};
                            final estado =
                                (o['estado'] ?? 'Pendiente').toString();

                            return Card(
                              child: ExpansionTile(
                                leading: Container(
                                  width: 10,
                                  height: 40,
                                  decoration: BoxDecoration(
                                    color: _statusColor(estado),
                                    borderRadius: BorderRadius.circular(4),
                                  ),
                                ),
                                title: Text(
                                  destino['nombre'] ?? 'Reserva',
                                  style: const TextStyle(
                                      fontWeight: FontWeight.w600),
                                ),
                                subtitle: Text(
                                  '${usuario['nombre'] ?? 'Usuario'} • ${_statusLabel(estado)}',
                                  style: TextStyle(
                                    color: _statusColor(estado),
                                    fontSize: 12,
                                  ),
                                ),
                                children: [
                                  Padding(
                                    padding: const EdgeInsets.fromLTRB(
                                        16, 0, 16, 12),
                                    child: Column(
                                      crossAxisAlignment:
                                          CrossAxisAlignment.start,
                                      children: [
                                        Text(
                                            'Email: ${usuario['email'] ?? '-'}'),
                                        Text(
                                            'Fecha: ${o['fecha_reserva'] ?? o['creado_en'] ?? '-'}'),
                                        Text(
                                            'Precio: \$${destino['precio'] ?? '-'}'),
                                        const SizedBox(height: 10),
                                        Row(
                                          children: [
                                            if (!estado
                                                .toLowerCase()
                                                .contains('confirm'))
                                              Expanded(
                                                child: ElevatedButton(
                                                  onPressed: () =>
                                                      _changeStatus(
                                                          o, 'confirmed'),
                                                  style: ElevatedButton
                                                      .styleFrom(
                                                    backgroundColor: AppTheme
                                                        .successColor,
                                                  ),
                                                  child: const Text(
                                                      'Confirmar'),
                                                ),
                                              ),
                                            if (!estado
                                                    .toLowerCase()
                                                    .contains('confirm') &&
                                                !estado
                                                    .toLowerCase()
                                                    .contains('cancel'))
                                              const SizedBox(width: 8),
                                            if (!estado
                                                .toLowerCase()
                                                .contains('cancel'))
                                              Expanded(
                                                child: OutlinedButton(
                                                  onPressed: () =>
                                                      _changeStatus(
                                                          o, 'cancelled'),
                                                  style: OutlinedButton
                                                      .styleFrom(
                                                    foregroundColor:
                                                        AppTheme.dangerColor,
                                                    side: const BorderSide(
                                                        color: AppTheme
                                                            .dangerColor),
                                                  ),
                                                  child:
                                                      const Text('Cancelar'),
                                                ),
                                              ),
                                          ],
                                        ),
                                      ],
                                    ),
                                  ),
                                ],
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
