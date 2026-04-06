import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../configuracion/theme.dart';
import '../../modelos/destino.dart';
import '../../servicios/auth_service.dart';
import '../../servicios/destino_service.dart';
import '../../servicios/reserva_service.dart';
import '../../servicios/api_service.dart';
import '../../componentes/destino_card.dart';
import 'perfil_screen.dart';

class InicioScreen extends StatefulWidget {
  const InicioScreen({super.key});

  @override
  State<InicioScreen> createState() => _InicioScreenState();
}

class _InicioScreenState extends State<InicioScreen> {
  List<Destino> _destinos = [];
  List<Destino> _filtrados = [];
  bool _loading = true;
  String? _error;
  final _searchCtrl = TextEditingController();

  @override
  void initState() {
    super.initState();
    _loadDestinos();
  }

  @override
  void dispose() {
    _searchCtrl.dispose();
    super.dispose();
  }

  Future<void> _loadDestinos() async {
    setState(() {
      _loading = true;
      _error = null;
    });
    try {
      _destinos = await DestinoService.getDestinos();
      _filtrados = _destinos;
    } on ApiException catch (e) {
      _error = e.message;
    } catch (e) {
      _error = 'Error de conexión';
    }
    if (mounted) setState(() => _loading = false);
  }

  void _buscar(String query) {
    setState(() {
      if (query.isEmpty) {
        _filtrados = _destinos;
      } else {
        final q = query.toLowerCase();
        _filtrados = _destinos.where((d) {
          return d.nombre.toLowerCase().contains(q) ||
              (d.ciudad?.toLowerCase().contains(q) ?? false) ||
              (d.pais?.toLowerCase().contains(q) ?? false);
        }).toList();
      }
    });
  }

  Future<void> _reservar(Destino destino) async {
    final auth = context.read<AuthService>();
    if (auth.currentUser == null) return;

    final confirm = await showDialog<bool>(
      context: context,
      builder: (ctx) => AlertDialog(
        title: Text('Reservar ${destino.nombre}'),
        content: Text(
          '¿Deseas reservar este destino?\n\nPrecio: ${destino.precioFormateado}',
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(ctx, false),
            child: const Text('Cancelar'),
          ),
          ElevatedButton(
            onPressed: () => Navigator.pop(ctx, true),
            child: const Text('Reservar'),
          ),
        ],
      ),
    );

    if (confirm != true || !mounted) return;

    try {
      await ReservaService.crearReserva(
        userId: auth.currentUser!.id,
        destinationId: destino.id,
      );
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text('¡Reserva creada! Revisa "Mis Viajes"'),
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

  void _showDetail(Destino destino) {
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(20)),
      ),
      builder: (ctx) => DraggableScrollableSheet(
        expand: false,
        initialChildSize: 0.7,
        maxChildSize: 0.95,
        builder: (_, scrollCtrl) => SingleChildScrollView(
          controller: scrollCtrl,
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // Imagen
              if (destino.imageUrl.isNotEmpty)
                ClipRRect(
                  borderRadius:
                      const BorderRadius.vertical(top: Radius.circular(20)),
                  child: Image.network(
                    destino.imageUrl,
                    height: 220,
                    width: double.infinity,
                    fit: BoxFit.cover,
                  ),
                ),
              Padding(
                padding: const EdgeInsets.all(20),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      destino.nombre,
                      style: const TextStyle(
                        fontSize: 22,
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                    const SizedBox(height: 8),
                    if (destino.ciudad != null || destino.pais != null)
                      Row(
                        children: [
                          const Icon(Icons.location_on,
                              size: 16, color: AppTheme.textSecondary),
                          const SizedBox(width: 4),
                          Text(
                            [destino.ciudad, destino.pais]
                                .where((e) => e != null)
                                .join(', '),
                            style: const TextStyle(color: AppTheme.textSecondary),
                          ),
                        ],
                      ),
                    const SizedBox(height: 12),
                    // Info chips
                    Wrap(
                      spacing: 8,
                      runSpacing: 8,
                      children: [
                        if (destino.clima != null)
                          _chip(Icons.wb_sunny, destino.clima!),
                        if (destino.dificultad != null)
                          _chip(Icons.terrain, destino.dificultad!),
                        if (destino.duracion != null)
                          _chip(Icons.schedule, destino.duracion!),
                        if (destino.categoria != null)
                          _chip(Icons.category, destino.categoria!),
                      ],
                    ),
                    const SizedBox(height: 16),
                    if (destino.descripcion != null) ...[
                      Text(
                        destino.descripcion!,
                        style: const TextStyle(
                          fontSize: 14,
                          color: AppTheme.textSecondary,
                          height: 1.5,
                        ),
                      ),
                      const SizedBox(height: 16),
                    ],
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        Text(
                          destino.precioFormateado,
                          style: const TextStyle(
                            fontSize: 20,
                            fontWeight: FontWeight.bold,
                            color: AppTheme.primaryColor,
                          ),
                        ),
                        if (destino.rating != null)
                          Row(
                            children: [
                              const Icon(Icons.star,
                                  color: AppTheme.warningColor, size: 20),
                              const SizedBox(width: 4),
                              Text(
                                destino.rating!.toStringAsFixed(1),
                                style: const TextStyle(
                                  fontSize: 16,
                                  fontWeight: FontWeight.w600,
                                ),
                              ),
                            ],
                          ),
                      ],
                    ),
                    const SizedBox(height: 20),
                    SizedBox(
                      width: double.infinity,
                      child: ElevatedButton.icon(
                        onPressed: () {
                          Navigator.pop(ctx);
                          _reservar(destino);
                        },
                        icon: const Icon(Icons.flight_takeoff),
                        label: const Text('Reservar Ahora'),
                      ),
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

  Widget _chip(IconData icon, String label) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
      decoration: BoxDecoration(
        color: AppTheme.primaryColor.withAlpha(20),
        borderRadius: BorderRadius.circular(20),
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          Icon(icon, size: 14, color: AppTheme.primaryColor),
          const SizedBox(width: 4),
          Text(label,
              style:
                  const TextStyle(fontSize: 12, color: AppTheme.primaryColor)),
        ],
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final auth = context.watch<AuthService>();
    final user = auth.currentUser;

    return Scaffold(
      appBar: AppBar(
        title: const Text('Tropical Travel'),
        actions: [
          IconButton(
            icon: CircleAvatar(
              radius: 16,
              backgroundColor: AppTheme.secondaryColor,
              child: Text(
                user?.initials ?? 'U',
                style: const TextStyle(
                    fontSize: 12, color: Colors.white, fontWeight: FontWeight.bold),
              ),
            ),
            onPressed: () => Navigator.push(
              context,
              MaterialPageRoute(builder: (_) => const PerfilScreen()),
            ),
          ),
        ],
      ),
      body: Column(
        children: [
          // Hero bienvenida
          Container(
            width: double.infinity,
            padding: const EdgeInsets.all(20),
            decoration: const BoxDecoration(
              gradient: LinearGradient(
                colors: [AppTheme.primaryColor, AppTheme.secondaryColor],
              ),
            ),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  '¡Hola, ${user?.nombre ?? 'Viajero'}! 👋',
                  style: const TextStyle(
                    color: Colors.white,
                    fontSize: 20,
                    fontWeight: FontWeight.bold,
                  ),
                ),
                const SizedBox(height: 4),
                const Text(
                  'Descubre los mejores destinos de Colombia',
                  style: TextStyle(color: Colors.white70, fontSize: 14),
                ),
                const SizedBox(height: 14),
                // Barra búsqueda
                TextField(
                  controller: _searchCtrl,
                  onChanged: _buscar,
                  decoration: InputDecoration(
                    hintText: 'Buscar destinos...',
                    filled: true,
                    fillColor: Colors.white,
                    prefixIcon: const Icon(Icons.search),
                    suffixIcon: _searchCtrl.text.isNotEmpty
                        ? IconButton(
                            icon: const Icon(Icons.clear),
                            onPressed: () {
                              _searchCtrl.clear();
                              _buscar('');
                            },
                          )
                        : null,
                    border: OutlineInputBorder(
                      borderRadius: BorderRadius.circular(30),
                      borderSide: BorderSide.none,
                    ),
                    contentPadding: const EdgeInsets.symmetric(vertical: 0),
                  ),
                ),
              ],
            ),
          ),
          // Contenido
          Expanded(
            child: _loading
                ? const Center(child: CircularProgressIndicator())
                : _error != null
                    ? Center(
                        child: Column(
                          mainAxisSize: MainAxisSize.min,
                          children: [
                            const Icon(Icons.error_outline,
                                size: 48, color: AppTheme.dangerColor),
                            const SizedBox(height: 8),
                            Text(_error!),
                            const SizedBox(height: 12),
                            ElevatedButton(
                              onPressed: _loadDestinos,
                              child: const Text('Reintentar'),
                            ),
                          ],
                        ),
                      )
                    : _filtrados.isEmpty
                        ? const Center(
                            child: Text('No se encontraron destinos'))
                        : RefreshIndicator(
                            onRefresh: _loadDestinos,
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
                                  onTap: () => _showDetail(d),
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
