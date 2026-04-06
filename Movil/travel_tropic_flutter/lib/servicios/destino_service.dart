import '../modelos/destino.dart';
import 'api_service.dart';

class DestinoService {
  static Future<List<Destino>> getDestinos() async {
    final list = await ApiService.getList('/destinos');
    return list.map((d) => Destino.fromJson(d)).toList();
  }

  static Future<List<Destino>> buscar(String query) async {
    final destinos = await getDestinos();
    final q = query.toLowerCase();
    return destinos.where((d) {
      return d.nombre.toLowerCase().contains(q) ||
          (d.ciudad?.toLowerCase().contains(q) ?? false) ||
          (d.pais?.toLowerCase().contains(q) ?? false) ||
          (d.descripcion?.toLowerCase().contains(q) ?? false) ||
          (d.categoria?.toLowerCase().contains(q) ?? false);
    }).toList();
  }

  static Future<List<Destino>> filtrarPorCategoria(String categoria) async {
    final destinos = await getDestinos();
    if (categoria.isEmpty || categoria == 'Todos') return destinos;
    final cat = categoria.toLowerCase();
    return destinos.where((d) {
      return (d.categoria?.toLowerCase().contains(cat) ?? false) ||
          (d.clima?.toLowerCase().contains(cat) ?? false);
    }).toList();
  }
}
