class AppConstants {
  // Cambia esta URL al IP/dominio de tu servidor Express
  // Para emulador Android usa 10.0.2.2, para dispositivo real usa la IP local
  static const String apiBaseUrl = 'http://10.0.2.2:5501';

  // Supabase (solo referencia, la conexión real va por el backend Express)
  static const String supabaseUrl = 'https://qyhbrwzzexcwpupydlnq.supabase.co';

  static const String appName = 'Tropical Travel';
  static const String appVersion = '1.0.0';

  // Keys para SharedPreferences
  static const String keyAuthToken = 'authToken';
  static const String keyLoggedUser = 'loggedUser';

  // Roles
  static const String roleAdmin = 'admin';
  static const String roleCliente = 'cliente';
}
