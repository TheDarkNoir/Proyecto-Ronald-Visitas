import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../configuracion/theme.dart';
import '../../modelos/destino.dart';
import '../../servicios/auth_service.dart';
import '../../servicios/destino_service.dart';
import '../../servicios/reserva_service.dart';
import '../../servicios/api_service.dart';
import '../../componentes/destino_card.dart';

class ExplorarScreen extends StatefulWidget {
  const ExplorarScreen({super.key});

  @override
  State<ExplorarScreen> createState() => _ExplorarScreenState();
}

class _ExplorarScreenState extends State<ExplorarScreen> {
  List<Destino> _destinos = [];
  List<Destino> _filtrados = [];
  bool _loading = true;
  String _categoriaActiva = 'Todos';
  final _searchCtrl = TextEditingController();

  final _categorias = [
    'Todos', 'Playa', 'Naturaleza', 'Aventura', 'Cultura', 'Gastronomía',
  ];

  @override
  void initState() {
    super.initState();
    _load();
  }

  @override
  void dispose() {
    _searchCtrl.dispose();
    super.dispose();
  }

  Future<void> _load() async {
    setState(() => _loading = true);
    try {
      _destinos = await DestinoService.getDestinos();
      _aplicarFiltros();
    } catch (_) {}
    if (mounted) setState(() => _loading = false);
  }

  void _aplicarFiltros() {
    var list = List<Destino>.from(_destinos);

    // Filtro categoría
    if (_categoriaActiva != 'Todos') {
      final cat = _categoriaActiva.toLowerCase();
      list = list.where((d) {
        return (d.categoria?.toLowerCase().contains(cat) ?? false) ||
            (d.clima?.toLowerCase().contains(cat) ?? false) ||
            (d.descripcion?.toLowerCase().contains(cat) ?? false);
      }).toList();
    }

    // Filtro búsqueda
    final q = _searchCtrl.text.toLowerCase();
    if (q.isNotEmpty) {
      list = list.where((d) {
        return d.nombre.toLowerCase().contains(q) ||
            (d.ciudad?.toLowerCase().contains(q) ?? false) ||
            (d.pais?.toLowerCase().contains(q) ?? false);
      }).toList();
    }

    setState(() => _filtrados = list);
  }

  Future<void> _reservar(Destino destino) async {
    final auth = context.read<AuthService>();
    if (auth.currentUser == null) return;

    try {
      await ReservaService.crearReserva(
        userId: auth.currentUser!.id,
        destinationId: destino.id,
      );
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text('¡Reserva creada exitosamente!'),
          backgroundColor: AppTheme.successColor,
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
      appBar: AppBar(title: const Text('Explorar')),
      body: Column(
        children: [
          // Búsqueda
          Padding(
            padding: const EdgeInsets.fromLTRB(16, 12, 16, 0),
            child: TextField(
              controller: _searchCtrl,
              onChanged: (_) => _aplicarFiltros(),
              decoration: InputDecoration(
                hintText: 'Buscar destinos...',
                prefixIcon: const Icon(Icons.search),
                suffixIcon: _searchCtrl.text.isNotEmpty
                    ? IconButton(
                        icon: const Icon(Icons.clear),
                        onPressed: () {
                          _searchCtrl.clear();
                          _aplicarFiltros();
                        },
                      )
                    : null,
              ),
            ),
          ),

          // Categorías
          SizedBox(
            height: 50,
            child: ListView.builder(
              scrollDirection: Axis.horizontal,
              padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
              itemCount: _categorias.length,
              itemBuilder: (_, i) {
                final cat = _categorias[i];
                final active = cat == _categoriaActiva;
                return Padding(
                  padding: const EdgeInsets.symmetric(horizontal: 4),
                  child: ChoiceChip(
                    label: Text(cat),
                    selected: active,
                    selectedColor: AppTheme.primaryColor,
                    labelStyle: TextStyle(
                      color: active ? Colors.white : AppTheme.textPrimary,
                      fontWeight: active ? FontWeight.w600 : FontWeight.normal,
                    ),
                    onSelected: (_) {
                      _categoriaActiva = cat;
                      _aplicarFiltros();
                    },
                  ),
                );
              },
            ),
          ),

          // Grid
          Expanded(
            child: _loading
                ? const Center(child: CircularProgressIndicator())
                : _filtrados.isEmpty
                    ? const Center(child: Text('No hay destinos para esta categoría'))
                    : RefreshIndicator(
                        onRefresh: _load,
                        child: GridView.builder(
                          padding: const EdgeInsets.all(16),
                          gridDelegate:
                              const SliverGridDelegateWithFixedCrossAxisCount(
                            crossAxisCount: 2,
                            childAspectRatio: 0.65,
                            crossAxisSpacing: 12,
                            mainAxisSpacing: 12,
                          ),
                          itemCount: _filtrados.length,
                          itemBuilder: (_, i) {
                            final d = _filtrados[i];
                            return DestinoCard(
                              destino: d,
                              onTap: () => _reservar(d),
                              onReservar: () => _reservar(d),
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
