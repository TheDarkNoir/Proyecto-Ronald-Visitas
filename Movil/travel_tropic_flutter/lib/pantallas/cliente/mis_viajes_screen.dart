import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../configuracion/theme.dart';
import '../../modelos/reserva.dart';
import '../../servicios/auth_service.dart';
import '../../servicios/reserva_service.dart';
import '../../servicios/api_service.dart';
import '../../componentes/reserva_card.dart';

class MisViajesScreen extends StatefulWidget {
  const MisViajesScreen({super.key});

  @override
  State<MisViajesScreen> createState() => _MisViajesScreenState();
}

class _MisViajesScreenState extends State<MisViajesScreen> {
  List<Reserva> _reservas = [];
  bool _loading = true;
  String? _error;
  String _filtroEstado = 'Todos';

  final _filtros = ['Todos', 'Pendiente', 'Confirmada', 'Cancelada'];

  @override
  void initState() {
    super.initState();
    _load();
  }

  Future<void> _load() async {
    final auth = context.read<AuthService>();
    if (auth.currentUser == null) return;

    setState(() {
      _loading = true;
      _error = null;
    });
    try {
      _reservas = await ReservaService.getMisReservas(auth.currentUser!.id);
    } on ApiException catch (e) {
      _error = e.message;
    } catch (e) {
      _error = 'Error cargando reservas';
    }
    if (mounted) setState(() => _loading = false);
  }

  List<Reserva> get _filtradas {
    if (_filtroEstado == 'Todos') return _reservas;
    return _reservas.where((r) {
      return r.estadoDisplay == _filtroEstado;
    }).toList();
  }

  Future<void> _cancelar(Reserva reserva) async {
    final confirm = await showDialog<bool>(
      context: context,
      builder: (ctx) => AlertDialog(
        title: const Text('Cancelar reserva'),
        content: Text('¿Deseas cancelar tu reserva a ${reserva.destinoNombre}?'),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(ctx, false),
            child: const Text('No'),
          ),
          ElevatedButton(
            onPressed: () => Navigator.pop(ctx, true),
            style: ElevatedButton.styleFrom(backgroundColor: AppTheme.dangerColor),
            child: const Text('Sí, cancelar'),
          ),
        ],
      ),
    );

    if (confirm != true || !mounted) return;

    try {
      await ReservaService.cancelarReserva(reserva.id);
      _load();
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text('Reserva cancelada'),
          backgroundColor: AppTheme.warningColor,
        ),
      );
    } on ApiException catch (e) {
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text(e.message), backgroundColor: AppTheme.dangerColor),
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Mis Viajes')),
      body: Column(
        children: [
          // Filtros
          SizedBox(
            height: 50,
            child: ListView.builder(
              scrollDirection: Axis.horizontal,
              padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
              itemCount: _filtros.length,
              itemBuilder: (_, i) {
                final f = _filtros[i];
                final active = f == _filtroEstado;
                return Padding(
                  padding: const EdgeInsets.symmetric(horizontal: 4),
                  child: ChoiceChip(
                    label: Text(f),
                    selected: active,
                    selectedColor: AppTheme.primaryColor,
                    labelStyle: TextStyle(
                      color: active ? Colors.white : AppTheme.textPrimary,
                      fontWeight: active ? FontWeight.w600 : FontWeight.normal,
                    ),
                    onSelected: (_) => setState(() => _filtroEstado = f),
                  ),
                );
              },
            ),
          ),

          // Lista
          Expanded(
            child: _loading
                ? const Center(child: CircularProgressIndicator())
                : _error != null
                    ? Center(
                        child: Column(
                          mainAxisSize: MainAxisSize.min,
                          children: [
                            Text(_error!),
                            const SizedBox(height: 12),
                            ElevatedButton(
                              onPressed: _load,
                              child: const Text('Reintentar'),
                            ),
                          ],
                        ),
                      )
                    : _filtradas.isEmpty
                        ? Center(
                            child: Column(
                              mainAxisSize: MainAxisSize.min,
                              children: [
                                Icon(Icons.luggage_outlined,
                                    size: 64, color: Colors.grey[400]),
                                const SizedBox(height: 12),
                                const Text(
                                  'No tienes viajes aún',
                                  style: TextStyle(
                                    fontSize: 16,
                                    color: AppTheme.textSecondary,
                                  ),
                                ),
                                const SizedBox(height: 4),
                                const Text(
                                  'Explora destinos y reserva tu próxima aventura',
                                  style: TextStyle(
                                    fontSize: 13,
                                    color: AppTheme.textSecondary,
                                  ),
                                ),
                              ],
                            ),
                          )
                        : RefreshIndicator(
                            onRefresh: _load,
                            child: ListView.separated(
                              padding: const EdgeInsets.all(16),
                              itemCount: _filtradas.length,
                              separatorBuilder: (_, __) =>
                                  const SizedBox(height: 10),
                              itemBuilder: (_, i) {
                                final r = _filtradas[i];
                                return ReservaCard(
                                  reserva: r,
                                  onCancelar: () => _cancelar(r),
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
