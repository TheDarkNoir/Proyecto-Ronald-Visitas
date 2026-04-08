import 'package:flutter/material.dart';
import '../modelos/reserva.dart';
import '../configuracion/theme.dart';

class ReservaCard extends StatelessWidget {
  final Reserva reserva;
  final VoidCallback? onCancelar;
  final VoidCallback? onTap;

  const ReservaCard({
    super.key,
    required this.reserva,
    this.onCancelar,
    this.onTap,
  });

  Color get _statusColor {
    if (reserva.isConfirmed) return AppTheme.successColor;
    if (reserva.isCancelled) return AppTheme.dangerColor;
    return AppTheme.warningColor;
  }

  IconData get _statusIcon {
    if (reserva.isConfirmed) return Icons.check_circle;
    if (reserva.isCancelled) return Icons.cancel;
    return Icons.schedule;
  }

  @override
  Widget build(BuildContext context) {
    return Card(
      child: InkWell(
        onTap: onTap,
        borderRadius: BorderRadius.circular(16),
        child: Row(
          children: [
            // Imagen
            ClipRRect(
              borderRadius: const BorderRadius.horizontal(
                left: Radius.circular(16),
              ),
              child:
                  reserva.destinoImagen != null &&
                      reserva.destinoImagen!.isNotEmpty
                  ? Image.network(
                      reserva.destinoImagen!,
                      width: 110,
                      height: 110,
                      fit: BoxFit.cover,
                      errorBuilder: (_, _, _) => _placeholder(),
                    )
                  : _placeholder(),
            ),
            // Info
            Expanded(
              child: Padding(
                padding: const EdgeInsets.all(12),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      reserva.destinoNombre ?? 'Destino',
                      style: const TextStyle(
                        fontSize: 15,
                        fontWeight: FontWeight.bold,
                        color: AppTheme.textPrimary,
                      ),
                      maxLines: 1,
                      overflow: TextOverflow.ellipsis,
                    ),
                    const SizedBox(height: 4),
                    if (reserva.destinoPais != null)
                      Row(
                        children: [
                          const Icon(
                            Icons.location_on,
                            size: 13,
                            color: AppTheme.textSecondary,
                          ),
                          const SizedBox(width: 3),
                          Text(
                            [reserva.destinoCiudad, reserva.destinoPais]
                                .where((e) => e != null && e.isNotEmpty)
                                .join(', '),
                            style: const TextStyle(
                              fontSize: 12,
                              color: AppTheme.textSecondary,
                            ),
                          ),
                        ],
                      ),
                    const SizedBox(height: 6),
                    // Estado
                    Container(
                      padding: const EdgeInsets.symmetric(
                        horizontal: 8,
                        vertical: 3,
                      ),
                      decoration: BoxDecoration(
                        color: _statusColor.withAlpha(30),
                        borderRadius: BorderRadius.circular(8),
                      ),
                      child: Row(
                        mainAxisSize: MainAxisSize.min,
                        children: [
                          Icon(_statusIcon, size: 14, color: _statusColor),
                          const SizedBox(width: 4),
                          Text(
                            reserva.estadoDisplay,
                            style: TextStyle(
                              fontSize: 12,
                              color: _statusColor,
                              fontWeight: FontWeight.w600,
                            ),
                          ),
                        ],
                      ),
                    ),
                    if (reserva.isPending && onCancelar != null) ...[
                      const SizedBox(height: 6),
                      SizedBox(
                        height: 30,
                        child: OutlinedButton(
                          onPressed: onCancelar,
                          style: OutlinedButton.styleFrom(
                            foregroundColor: AppTheme.dangerColor,
                            side: const BorderSide(color: AppTheme.dangerColor),
                            padding: const EdgeInsets.symmetric(horizontal: 12),
                            textStyle: const TextStyle(fontSize: 12),
                          ),
                          child: const Text('Cancelar'),
                        ),
                      ),
                    ],
                  ],
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _placeholder() {
    return Container(
      width: 110,
      height: 110,
      color: Colors.grey[200],
      child: const Icon(Icons.landscape, size: 36, color: Colors.grey),
    );
  }
}
