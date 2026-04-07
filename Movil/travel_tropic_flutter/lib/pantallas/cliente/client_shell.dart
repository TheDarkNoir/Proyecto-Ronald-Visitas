import 'package:flutter/material.dart';
import '../../configuracion/theme.dart';
import 'inicio_screen.dart';
import 'explorar_screen.dart';
import 'mis_viajes_screen.dart';
import 'comunidad_screen.dart';
import 'ia_chat_screen.dart';

class ClientShell extends StatefulWidget {
  const ClientShell({super.key});

  @override
  State<ClientShell> createState() => _ClientShellState();
}

class _ClientShellState extends State<ClientShell> {
  int _currentIndex = 0;

  final _screens = const [
    InicioScreen(),
    ExplorarScreen(),
    MisViajesScreen(),
    ComunidadScreen(),
    IAChatScreen(),
  ];

  final _items = const [
    (
      label: 'Inicio',
      icon: Icons.home_outlined,
      selectedIcon: Icons.home_rounded,
    ),
    (
      label: 'Explorar',
      icon: Icons.explore_outlined,
      selectedIcon: Icons.explore_rounded,
    ),
    (
      label: 'Viajes',
      icon: Icons.luggage_outlined,
      selectedIcon: Icons.luggage_rounded,
    ),
    (
      label: 'Comunidad',
      icon: Icons.groups_outlined,
      selectedIcon: Icons.groups_rounded,
    ),
    (
      label: 'IA',
      icon: Icons.auto_awesome_outlined,
      selectedIcon: Icons.auto_awesome_rounded,
    ),
  ];

  Future<void> _openNavigationMenu() async {
    final selectedIndex = await showModalBottomSheet<int>(
      context: context,
      backgroundColor: Colors.transparent,
      builder: (context) {
        return SafeArea(
          child: Padding(
            padding: const EdgeInsets.fromLTRB(12, 0, 12, 12),
            child: DecoratedBox(
              decoration: BoxDecoration(
                color: Colors.white,
                borderRadius: BorderRadius.circular(28),
                boxShadow: [
                  BoxShadow(
                    color: Colors.black.withAlpha(22),
                    blurRadius: 28,
                    offset: const Offset(0, 14),
                  ),
                ],
              ),
              child: Padding(
                padding: const EdgeInsets.fromLTRB(12, 10, 12, 16),
                child: Column(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    Container(
                      width: 42,
                      height: 5,
                      decoration: BoxDecoration(
                        color: Colors.black.withAlpha(25),
                        borderRadius: BorderRadius.circular(999),
                      ),
                    ),
                    const SizedBox(height: 14),
                    const Text(
                      'Moverse por la app',
                      style: TextStyle(
                        fontSize: 16,
                        fontWeight: FontWeight.w700,
                        color: AppTheme.textPrimary,
                      ),
                    ),
                    const SizedBox(height: 10),
                    ...List.generate(_items.length, (index) {
                      final item = _items[index];
                      final isActive = index == _currentIndex;
                      return Padding(
                        padding: const EdgeInsets.only(top: 8),
                        child: Material(
                          color: isActive
                              ? AppTheme.primaryColor.withAlpha(20)
                              : Colors.transparent,
                          borderRadius: BorderRadius.circular(18),
                          child: ListTile(
                            shape: RoundedRectangleBorder(
                              borderRadius: BorderRadius.circular(18),
                            ),
                            leading: Icon(
                              isActive ? item.selectedIcon : item.icon,
                              color: isActive
                                  ? AppTheme.primaryColor
                                  : AppTheme.textSecondary,
                            ),
                            title: Text(
                              item.label,
                              style: TextStyle(
                                fontWeight:
                                    isActive ? FontWeight.w700 : FontWeight.w500,
                                color: isActive
                                    ? AppTheme.primaryColor
                                    : AppTheme.textPrimary,
                              ),
                            ),
                            trailing: isActive
                                ? const Icon(
                                    Icons.check_circle,
                                    color: AppTheme.primaryColor,
                                  )
                                : const Icon(
                                    Icons.chevron_right,
                                    color: AppTheme.textSecondary,
                                  ),
                            onTap: () => Navigator.pop(context, index),
                          ),
                        ),
                      );
                    }),
                  ],
                ),
              ),
            ),
          ),
        );
      },
    );

    if (selectedIndex != null && selectedIndex != _currentIndex && mounted) {
      setState(() => _currentIndex = selectedIndex);
    }
  }

  @override
  Widget build(BuildContext context) {
    final currentItem = _items[_currentIndex];

    return Scaffold(
      body: IndexedStack(index: _currentIndex, children: _screens),
      bottomNavigationBar: SafeArea(
        top: false,
        child: Padding(
          padding: const EdgeInsets.fromLTRB(16, 0, 16, 12),
          child: Material(
            decoration: BoxDecoration(
              color: Colors.white,
              borderRadius: BorderRadius.circular(22),
              boxShadow: [
                BoxShadow(
                  color: Colors.black.withAlpha(18),
                  blurRadius: 22,
                  offset: const Offset(0, 10),
                ),
              ],
            ),
            borderRadius: BorderRadius.circular(22),
            child: InkWell(
              onTap: _openNavigationMenu,
              child: Padding(
                padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 10),
                child: Row(
                  children: [
                    Container(
                      width: 42,
                      height: 42,
                      decoration: BoxDecoration(
                        color: AppTheme.primaryColor.withAlpha(22),
                        borderRadius: BorderRadius.circular(14),
                      ),
                      child: Icon(
                        currentItem.selectedIcon,
                        color: AppTheme.primaryColor,
                      ),
                    ),
                    const SizedBox(width: 12),
                    Expanded(
                      child: Column(
                        mainAxisSize: MainAxisSize.min,
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          const Text(
                            'Menú',
                            style: TextStyle(
                              fontSize: 12,
                              color: AppTheme.textSecondary,
                            ),
                          ),
                          const SizedBox(height: 2),
                          Text(
                            currentItem.label,
                            style: const TextStyle(
                              fontSize: 16,
                              fontWeight: FontWeight.w700,
                              color: AppTheme.textPrimary,
                            ),
                          ),
                        ],
                      ),
                    ),
                    Container(
                      padding: const EdgeInsets.symmetric(
                        horizontal: 12,
                        vertical: 8,
                      ),
                      decoration: BoxDecoration(
                        color: AppTheme.secondaryColor.withAlpha(18),
                        borderRadius: BorderRadius.circular(999),
                      ),
                      child: const Row(
                        mainAxisSize: MainAxisSize.min,
                        children: [
                          Text(
                            'Abrir',
                            style: TextStyle(
                              color: AppTheme.secondaryColor,
                              fontWeight: FontWeight.w700,
                            ),
                          ),
                          SizedBox(width: 6),
                          Icon(
                            Icons.keyboard_arrow_up_rounded,
                            color: AppTheme.secondaryColor,
                          ),
                        ],
                      ),
                    ),
                  ],
                ),
              ),
            ),
          ),
        ),
      ),
    );
  }
}
