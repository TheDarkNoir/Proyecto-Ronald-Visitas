import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../configuracion/theme.dart';
import '../../servicios/auth_service.dart';
import '../../servicios/admin_service.dart';

class DashboardScreen extends StatefulWidget {
  const DashboardScreen({super.key});

  @override
  State<DashboardScreen> createState() => _DashboardScreenState();
}

class _DashboardScreenState extends State<DashboardScreen> {
  Map<String, dynamic>? _panel;
  bool _loading = true;
  String? _error;

  @override
  void initState() {
    super.initState();
    _load();
  }

  Future<void> _load() async {
    final auth = context.read<AuthService>();
    setState(() {
      _loading = true;
      _error = null;
    });
    try {
      _panel = await AdminService.getPanel(auth.currentUser!.id);
    } catch (e) {
      _error = e.toString();
    }
    if (mounted) setState(() => _loading = false);
  }

  @override
  Widget build(BuildContext context) {
    final auth = context.watch<AuthService>();

    return Scaffold(
      appBar: AppBar(
        title: const Text('Panel Admin'),
        actions: [
          IconButton(
            icon: const Icon(Icons.refresh),
            onPressed: _load,
          ),
          IconButton(
            icon: const Icon(Icons.logout),
            onPressed: () async {
              await auth.logout();
            },
          ),
        ],
      ),
      body: _loading
          ? const Center(child: CircularProgressIndicator())
          : _error != null
              ? Center(
                  child: Column(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      Text(_error!, textAlign: TextAlign.center),
                      const SizedBox(height: 12),
                      ElevatedButton(
                          onPressed: _load, child: const Text('Reintentar')),
                    ],
                  ),
                )
              : RefreshIndicator(
                  onRefresh: _load,
                  child: SingleChildScrollView(
                    physics: const AlwaysScrollableScrollPhysics(),
                    padding: const EdgeInsets.all(16),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          '¡Hola, ${auth.currentUser?.nombre ?? "Admin"}!',
                          style: const TextStyle(
                            fontSize: 22,
                            fontWeight: FontWeight.bold,
                          ),
                        ),
                        const SizedBox(height: 4),
                        const Text(
                          'Panel de administración',
                          style: TextStyle(color: AppTheme.textSecondary),
                        ),
                        const SizedBox(height: 20),

                        // Métricas
                        GridView.count(
                          crossAxisCount: 2,
                          shrinkWrap: true,
                          physics: const NeverScrollableScrollPhysics(),
                          crossAxisSpacing: 12,
                          mainAxisSpacing: 12,
                          childAspectRatio: 1.5,
                          children: [
                            _metricCard(
                              'Ventas Hoy',
                              _formatMoney(_getNum('ventasHoy')),
                              Icons.attach_money,
                              AppTheme.successColor,
                            ),
                            _metricCard(
                              'Reservas Activas',
                              _getNum('reservasActivas').toString(),
                              Icons.bookmark,
                              AppTheme.primaryColor,
                            ),
                            _metricCard(
                              'Nuevos Turistas',
                              _getNum('nuevosTuristas').toString(),
                              Icons.person_add,
                              AppTheme.accentColor,
                            ),
                            _metricCard(
                              'Rating Global',
                              '${_getNum('ratingGlobal').toStringAsFixed(1)} ⭐',
                              Icons.star,
                              AppTheme.warningColor,
                            ),
                          ],
                        ),
                        const SizedBox(height: 24),

                        // Alertas
                        if (_panel?['alertas'] != null &&
                            (_panel!['alertas'] as List).isNotEmpty) ...[
                          const Text(
                            'Alertas',
                            style: TextStyle(
                              fontSize: 18,
                              fontWeight: FontWeight.bold,
                            ),
                          ),
                          const SizedBox(height: 8),
                          ...(_panel!['alertas'] as List).map((a) {
                            return Card(
                              color: AppTheme.warningColor.withAlpha(20),
                              child: ListTile(
                                leading: const Icon(Icons.warning_amber,
                                    color: AppTheme.warningColor),
                                title: Text(a['titulo'] ?? a.toString()),
                                subtitle: a['mensaje'] != null
                                    ? Text(a['mensaje'])
                                    : null,
                              ),
                            );
                          }),
                          const SizedBox(height: 16),
                        ],

                        // Resumen rápido
                        const Text(
                          'Resumen',
                          style: TextStyle(
                            fontSize: 18,
                            fontWeight: FontWeight.bold,
                          ),
                        ),
                        const SizedBox(height: 8),
                        Card(
                          child: Padding(
                            padding: const EdgeInsets.all(16),
                            child: Column(
                              children: [
                                _summaryRow('Total Destinos',
                                    _getListLen('destinos').toString()),
                                const Divider(),
                                _summaryRow('Total Usuarios',
                                    _getListLen('usuarios').toString()),
                                const Divider(),
                                _summaryRow('Total Reservas',
                                    _getListLen('reservaciones').toString()),
                              ],
                            ),
                          ),
                        ),
                      ],
                    ),
                  ),
                ),
    );
  }

  num _getNum(String key) {
    final v = _panel?[key];
    if (v == null) return 0;
    if (v is num) return v;
    return num.tryParse(v.toString()) ?? 0;
  }

  int _getListLen(String key) {
    final v = _panel?[key];
    if (v is List) return v.length;
    return 0;
  }

  String _formatMoney(num n) {
    final s = n.toInt().toString();
    final buf = StringBuffer();
    for (int i = 0; i < s.length; i++) {
      if (i > 0 && (s.length - i) % 3 == 0) buf.write('.');
      buf.write(s[i]);
    }
    return '\$${buf.toString()} COP';
  }

  Widget _metricCard(String title, String value, IconData icon, Color color) {
    return Card(
      child: Padding(
        padding: const EdgeInsets.all(14),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Row(
              children: [
                Icon(icon, color: color, size: 22),
                const Spacer(),
              ],
            ),
            const SizedBox(height: 8),
            Text(
              value,
              style: TextStyle(
                fontSize: 18,
                fontWeight: FontWeight.bold,
                color: color,
              ),
            ),
            Text(
              title,
              style: const TextStyle(
                fontSize: 12,
                color: AppTheme.textSecondary,
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _summaryRow(String label, String value) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 4),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Text(label, style: const TextStyle(color: AppTheme.textSecondary)),
          Text(value,
              style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 16)),
        ],
      ),
    );
  }
}
