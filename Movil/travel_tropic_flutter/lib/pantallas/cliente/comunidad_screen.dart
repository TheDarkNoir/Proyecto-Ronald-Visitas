import 'dart:convert';
import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:shared_preferences/shared_preferences.dart';
import '../../configuracion/theme.dart';
import '../../servicios/auth_service.dart';
import '../../servicios/api_service.dart';

class ComunidadScreen extends StatefulWidget {
  const ComunidadScreen({super.key});

  @override
  State<ComunidadScreen> createState() => _ComunidadScreenState();
}

class _ChatMessage {
  final String senderId;
  final String senderName;
  final String text;
  final DateTime timestamp;

  _ChatMessage({
    required this.senderId,
    required this.senderName,
    required this.text,
    required this.timestamp,
  });

  Map<String, dynamic> toJson() => {
    'senderId': senderId,
    'senderName': senderName,
    'text': text,
    'timestamp': timestamp.toIso8601String(),
  };

  factory _ChatMessage.fromJson(Map<String, dynamic> json) => _ChatMessage(
    senderId: json['senderId'] ?? '',
    senderName: json['senderName'] ?? '',
    text: json['text'] ?? '',
    timestamp: DateTime.tryParse(json['timestamp'] ?? '') ?? DateTime.now(),
  );
}

class _ChatContact {
  final String id;
  final String nombre;
  final String? email;
  final bool isGroup;
  List<_ChatMessage> messages;

  _ChatContact({
    required this.id,
    required this.nombre,
    this.email,
    this.isGroup = false,
    List<_ChatMessage>? messages,
  }) : messages = messages ?? [];

  String get lastMessage =>
      messages.isNotEmpty ? messages.last.text : 'Sin mensajes';

  Map<String, dynamic> toJson() => {
    'id': id,
    'nombre': nombre,
    'email': email,
    'isGroup': isGroup,
    'messages': messages.map((m) => m.toJson()).toList(),
  };

  factory _ChatContact.fromJson(Map<String, dynamic> json) => _ChatContact(
    id: json['id'] ?? '',
    nombre: json['nombre'] ?? '',
    email: json['email'],
    isGroup: json['isGroup'] ?? false,
    messages: (json['messages'] as List?)
        ?.map((m) => _ChatMessage.fromJson(m))
        .toList(),
  );
}

class _ComunidadScreenState extends State<ComunidadScreen> {
  List<Map<String, dynamic>> _usuarios = [];
  List<_ChatContact> _chats = [];
  _ChatContact? _activeChat;
  final _msgCtrl = TextEditingController();
  final _searchCtrl = TextEditingController();
  final _scrollCtrl = ScrollController();

  @override
  void initState() {
    super.initState();
    _loadChats();
    _loadUsuarios();
  }

  @override
  void dispose() {
    _msgCtrl.dispose();
    _searchCtrl.dispose();
    _scrollCtrl.dispose();
    super.dispose();
  }

  String get _userId => context.read<AuthService>().currentUser?.id ?? '';
  String get _userName => context.read<AuthService>().currentUser?.nombre ?? 'Yo';

  String get _storageKey => 'comunidadChats_$_userId';

  Future<void> _loadChats() async {
    final prefs = await SharedPreferences.getInstance();
    final raw = prefs.getString(_storageKey);
    if (raw != null) {
      final list = jsonDecode(raw) as List;
      setState(() {
        _chats = list.map((c) => _ChatContact.fromJson(c)).toList();
      });
    }
  }

  Future<void> _saveChats() async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.setString(
      _storageKey,
      jsonEncode(_chats.map((c) => c.toJson()).toList()),
    );
  }

  Future<void> _loadUsuarios() async {
    try {
      final list = await ApiService.getList('/usuarios?exclude=$_userId');
      setState(() => _usuarios = list.cast<Map<String, dynamic>>());
    } catch (_) {}
  }

  void _openChat(_ChatContact contact) {
    setState(() => _activeChat = contact);
    _scrollToBottom();
  }

  void _startNewChat(Map<String, dynamic> user) {
    final id = user['id']?.toString() ?? '';
    var existing = _chats.where((c) => c.id == id).toList();
    if (existing.isNotEmpty) {
      _openChat(existing.first);
    } else {
      final chat = _ChatContact(
        id: id,
        nombre: user['nombre'] ?? 'Usuario',
        email: user['email'],
      );
      _chats.insert(0, chat);
      _saveChats();
      _openChat(chat);
    }
  }

  void _sendMessage() {
    final text = _msgCtrl.text.trim();
    if (text.isEmpty || _activeChat == null) return;

    final msg = _ChatMessage(
      senderId: _userId,
      senderName: _userName,
      text: text,
      timestamp: DateTime.now(),
    );

    setState(() {
      _activeChat!.messages.add(msg);
    });
    _msgCtrl.clear();
    _saveChats();
    _scrollToBottom();

    // Auto-respuesta (simula como en la web)
    Future.delayed(const Duration(milliseconds: 1800), () {
      if (!mounted || _activeChat == null) return;
      final replies = [
        '¡Qué interesante! 🌴',
        'Me encanta la idea',
        '¿Cuándo viajamos?',
        'Colombia es hermosa 🇨🇴',
        'Buena recomendación!',
        'Yo también quiero ir 😍',
      ];
      final reply = _ChatMessage(
        senderId: _activeChat!.id,
        senderName: _activeChat!.nombre,
        text: (replies..shuffle()).first,
        timestamp: DateTime.now(),
      );
      setState(() {
        _activeChat!.messages.add(reply);
      });
      _saveChats();
      _scrollToBottom();
    });
  }

  void _scrollToBottom() {
    WidgetsBinding.instance.addPostFrameCallback((_) {
      if (_scrollCtrl.hasClients) {
        _scrollCtrl.animateTo(
          _scrollCtrl.position.maxScrollExtent,
          duration: const Duration(milliseconds: 200),
          curve: Curves.easeOut,
        );
      }
    });
  }

  // Breakpoint: >= 600px muestra split (lista + chat), < 600 muestra uno u otro
  bool get _isWide => MediaQuery.of(context).size.width >= 600;

  @override
  Widget build(BuildContext context) {
    if (_isWide) {
      return _buildSplitLayout();
    }
    // Móvil: lista o chat
    if (_activeChat != null) {
      return _buildChatScaffold(showBack: true);
    }
    return _buildListScaffold();
  }

  // ─── Layout para tablets / pantallas anchas ───────────────────────
  Widget _buildSplitLayout() {
    return Scaffold(
      appBar: AppBar(title: const Text('Comunidad')),
      body: Row(
        children: [
          // Panel izquierdo: lista de chats
          SizedBox(
            width: 280,
            child: _buildListPanel(),
          ),
          const VerticalDivider(width: 1),
          // Panel derecho: chat activo o placeholder
          Expanded(
            child: _activeChat != null
                ? _buildChatBody(chat: _activeChat!, maxBubbleFraction: 0.70)
                : const Center(
                    child: Column(
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        Icon(Icons.chat_bubble_outline, size: 56, color: Colors.grey),
                        SizedBox(height: 12),
                        Text('Selecciona una conversación',
                            style: TextStyle(color: AppTheme.textSecondary)),
                      ],
                    ),
                  ),
          ),
        ],
      ),
      floatingActionButton: _buildFAB(),
    );
  }

  // ─── Scaffold lista (solo móvil) ─────────────────────────────────
  Widget _buildListScaffold() {
    return Scaffold(
      appBar: AppBar(title: const Text('Comunidad')),
      body: _buildListPanel(),
      floatingActionButton: _buildFAB(),
    );
  }

  // ─── Scaffold chat (solo móvil, con back) ────────────────────────
  Widget _buildChatScaffold({required bool showBack}) {
    final chat = _activeChat!;
    return Scaffold(
      appBar: AppBar(
        leading: showBack
            ? IconButton(
                icon: const Icon(Icons.arrow_back),
                onPressed: () => setState(() => _activeChat = null),
              )
            : null,
        titleSpacing: showBack ? 0 : null,
        title: Row(
          children: [
            CircleAvatar(
              radius: 16,
              backgroundColor: chat.isGroup
                  ? AppTheme.accentColor
                  : AppTheme.secondaryColor,
              child: chat.isGroup
                  ? const Icon(Icons.group, color: Colors.white, size: 16)
                  : Text(
                      _initials(chat.nombre),
                      style: const TextStyle(color: Colors.white, fontSize: 11),
                    ),
            ),
            const SizedBox(width: 10),
            Expanded(
              child: Text(chat.nombre,
                  style: const TextStyle(fontSize: 16),
                  overflow: TextOverflow.ellipsis),
            ),
          ],
        ),
        actions: [
          IconButton(
            icon: const Icon(Icons.delete_outline, size: 20),
            tooltip: 'Eliminar chat',
            onPressed: () => _confirmDeleteChat(chat),
          ),
        ],
      ),
      body: _buildChatBody(chat: chat, maxBubbleFraction: 0.75),
    );
  }

  // ─── Panel de lista (reutilizado en móvil y split) ────────────────
  Widget _buildListPanel() {
    return Column(
      children: [
        // Barra de búsqueda
        Padding(
          padding: const EdgeInsets.fromLTRB(12, 12, 12, 4),
          child: SizedBox(
            height: 44,
            child: TextField(
              controller: _searchCtrl,
              onChanged: (_) => setState(() {}),
              style: const TextStyle(fontSize: 14),
              decoration: InputDecoration(
                hintText: 'Buscar usuarios...',
                hintStyle: const TextStyle(fontSize: 13),
                prefixIcon: const Icon(Icons.search, size: 20),
                suffixIcon: _searchCtrl.text.isNotEmpty
                    ? IconButton(
                        icon: const Icon(Icons.close, size: 18),
                        onPressed: () {
                          _searchCtrl.clear();
                          setState(() {});
                        },
                      )
                    : null,
                isDense: true,
                contentPadding: const EdgeInsets.symmetric(vertical: 0, horizontal: 12),
              ),
            ),
          ),
        ),

        // Resultados de búsqueda de usuarios
        if (_searchCtrl.text.isNotEmpty) ...[
          if (_usuariosFiltrados.isEmpty)
            const Padding(
              padding: EdgeInsets.all(16),
              child: Text('No se encontraron usuarios',
                  style: TextStyle(color: AppTheme.textSecondary, fontSize: 13)),
            )
          else
            SizedBox(
              height: 76,
              child: ListView.builder(
                scrollDirection: Axis.horizontal,
                padding: const EdgeInsets.symmetric(horizontal: 8),
                itemCount: _usuariosFiltrados.length,
                itemBuilder: (_, i) {
                  final u = _usuariosFiltrados[i];
                  return GestureDetector(
                    onTap: () {
                      _searchCtrl.clear();
                      _startNewChat(u);
                    },
                    child: Padding(
                      padding: const EdgeInsets.symmetric(horizontal: 6),
                      child: Column(
                        mainAxisSize: MainAxisSize.min,
                        children: [
                          CircleAvatar(
                            radius: 22,
                            backgroundColor: AppTheme.primaryColor,
                            child: Text(
                              _initials(u['nombre'] ?? ''),
                              style: const TextStyle(color: Colors.white, fontSize: 13),
                            ),
                          ),
                          const SizedBox(height: 4),
                          SizedBox(
                            width: 56,
                            child: Text(
                              (u['nombre'] ?? '').toString().split(' ').first,
                              style: const TextStyle(fontSize: 11),
                              maxLines: 1,
                              overflow: TextOverflow.ellipsis,
                              textAlign: TextAlign.center,
                            ),
                          ),
                        ],
                      ),
                    ),
                  );
                },
              ),
            ),
          const Divider(height: 1),
        ],

        // Lista de chats
        Expanded(
          child: _chats.isEmpty
              ? Center(
                  child: Padding(
                    padding: const EdgeInsets.symmetric(horizontal: 32),
                    child: Column(
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        Icon(Icons.forum_outlined, size: 52, color: Colors.grey.shade400),
                        const SizedBox(height: 10),
                        const Text('Sin conversaciones',
                            style: TextStyle(
                                fontWeight: FontWeight.w600, color: AppTheme.textSecondary)),
                        const SizedBox(height: 4),
                        const Text(
                          'Toca + para iniciar un chat\no busca usuarios arriba',
                          textAlign: TextAlign.center,
                          style: TextStyle(fontSize: 12, color: AppTheme.textSecondary),
                        ),
                      ],
                    ),
                  ),
                )
              : ListView.builder(
                  itemCount: _chats.length,
                  itemBuilder: (_, i) {
                    final c = _chats[i];
                    final isSelected = _activeChat?.id == c.id;
                    return Container(
                      color: isSelected ? AppTheme.primaryColor.withAlpha(20) : null,
                      child: ListTile(
                        dense: true,
                        visualDensity: const VisualDensity(vertical: -1),
                        leading: CircleAvatar(
                          radius: 20,
                          backgroundColor: c.isGroup
                              ? AppTheme.accentColor
                              : AppTheme.primaryColor,
                          child: c.isGroup
                              ? const Icon(Icons.group, color: Colors.white, size: 18)
                              : Text(
                                  _initials(c.nombre),
                                  style: const TextStyle(color: Colors.white, fontSize: 13),
                                ),
                        ),
                        title: Text(c.nombre,
                            style: const TextStyle(fontWeight: FontWeight.w600, fontSize: 14)),
                        subtitle: Text(c.lastMessage,
                            maxLines: 1,
                            overflow: TextOverflow.ellipsis,
                            style: const TextStyle(fontSize: 12)),
                        trailing: c.messages.isNotEmpty
                            ? Text(
                                _formatTime(c.messages.last.timestamp),
                                style: const TextStyle(fontSize: 10, color: AppTheme.textSecondary),
                              )
                            : null,
                        onTap: () => _openChat(c),
                        onLongPress: () => _confirmDeleteChat(c),
                      ),
                    );
                  },
                ),
        ),
      ],
    );
  }

  // ─── Cuerpo del chat (mensajes + input) ───────────────────────────
  Widget _buildChatBody({
    required _ChatContact chat,
    required double maxBubbleFraction,
  }) {
    return Column(
      children: [
        // Header con info del contacto (solo en split)
        if (_isWide)
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 10),
            decoration: BoxDecoration(
              color: Colors.white,
              boxShadow: [
                BoxShadow(color: Colors.black.withAlpha(8), blurRadius: 2, offset: const Offset(0, 1)),
              ],
            ),
            child: Row(
              children: [
                CircleAvatar(
                  radius: 18,
                  backgroundColor: chat.isGroup ? AppTheme.accentColor : AppTheme.secondaryColor,
                  child: chat.isGroup
                      ? const Icon(Icons.group, color: Colors.white, size: 18)
                      : Text(_initials(chat.nombre),
                          style: const TextStyle(color: Colors.white, fontSize: 12)),
                ),
                const SizedBox(width: 12),
                Expanded(
                  child: Text(chat.nombre,
                      style: const TextStyle(fontWeight: FontWeight.w600, fontSize: 15)),
                ),
                IconButton(
                  icon: const Icon(Icons.delete_outline, size: 20),
                  tooltip: 'Eliminar chat',
                  onPressed: () => _confirmDeleteChat(chat),
                ),
              ],
            ),
          ),

        // Mensajes
        Expanded(
          child: chat.messages.isEmpty
              ? const Center(
                  child: Text('Inicia la conversación',
                      style: TextStyle(color: AppTheme.textSecondary)),
                )
              : ListView.builder(
                  controller: _scrollCtrl,
                  padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
                  itemCount: chat.messages.length,
                  itemBuilder: (_, i) {
                    final msg = chat.messages[i];
                    final isMe = msg.senderId == _userId;
                    return Align(
                      alignment: isMe ? Alignment.centerRight : Alignment.centerLeft,
                      child: Container(
                        margin: const EdgeInsets.symmetric(vertical: 3),
                        padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 9),
                        constraints: BoxConstraints(
                          maxWidth: MediaQuery.of(context).size.width * maxBubbleFraction,
                        ),
                        decoration: BoxDecoration(
                          color: isMe ? AppTheme.primaryColor : Colors.white,
                          borderRadius: BorderRadius.only(
                            topLeft: const Radius.circular(14),
                            topRight: const Radius.circular(14),
                            bottomLeft: Radius.circular(isMe ? 14 : 2),
                            bottomRight: Radius.circular(isMe ? 2 : 14),
                          ),
                          boxShadow: [
                            BoxShadow(color: Colors.black.withAlpha(10), blurRadius: 3),
                          ],
                        ),
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            if (!isMe)
                              Text(
                                msg.senderName,
                                style: TextStyle(
                                  fontSize: 11,
                                  fontWeight: FontWeight.w600,
                                  color: AppTheme.secondaryColor,
                                ),
                              ),
                            Text(
                              msg.text,
                              style: TextStyle(
                                color: isMe ? Colors.white : AppTheme.textPrimary,
                              ),
                            ),
                          ],
                        ),
                      ),
                    );
                  },
                ),
        ),

        // Input
        SafeArea(
          top: false,
          child: Container(
            padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 6),
            decoration: BoxDecoration(
              color: Colors.white,
              boxShadow: [
                BoxShadow(
                  color: Colors.black.withAlpha(13),
                  blurRadius: 4,
                  offset: const Offset(0, -2),
                ),
              ],
            ),
            child: Row(
              children: [
                Expanded(
                  child: TextField(
                    controller: _msgCtrl,
                    textInputAction: TextInputAction.send,
                    onSubmitted: (_) => _sendMessage(),
                    style: const TextStyle(fontSize: 14),
                    decoration: const InputDecoration(
                      hintText: 'Escribe un mensaje...',
                      hintStyle: TextStyle(fontSize: 13),
                      border: InputBorder.none,
                      contentPadding: EdgeInsets.symmetric(horizontal: 12),
                    ),
                  ),
                ),
                IconButton(
                  icon: const Icon(Icons.send, color: AppTheme.primaryColor),
                  onPressed: _sendMessage,
                ),
              ],
            ),
          ),
        ),
      ],
    );
  }

  // ─── FAB con opciones ─────────────────────────────────────────────
  Widget _buildFAB() {
    return FloatingActionButton(
      backgroundColor: AppTheme.primaryColor,
      onPressed: _showNewChatSheet,
      child: const Icon(Icons.add, color: Colors.white),
    );
  }

  void _showNewChatSheet() {
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(20)),
      ),
      builder: (ctx) {
        return DraggableScrollableSheet(
          initialChildSize: 0.6,
          minChildSize: 0.3,
          maxChildSize: 0.85,
          expand: false,
          builder: (_, scrollCtrl) {
            return _NewChatSheet(
              scrollController: scrollCtrl,
              usuarios: _usuarios,
              initials: _initials,
              onSelectUser: (u) {
                Navigator.pop(ctx);
                _startNewChat(u);
              },
              onCreateGroup: (name) {
                Navigator.pop(ctx);
                _createGroup(name);
              },
            );
          },
        );
      },
    );
  }

  void _createGroup(String name) {
    final group = _ChatContact(
      id: 'group_${DateTime.now().millisecondsSinceEpoch}',
      nombre: name,
      isGroup: true,
    );
    _chats.insert(0, group);
    _saveChats();
    _openChat(group);
  }

  void _confirmDeleteChat(_ChatContact chat) {
    showDialog(
      context: context,
      builder: (ctx) => AlertDialog(
        title: const Text('Eliminar conversación'),
        content: Text('¿Eliminar el chat con ${chat.nombre}?'),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(ctx),
            child: const Text('Cancelar'),
          ),
          ElevatedButton(
            style: ElevatedButton.styleFrom(backgroundColor: AppTheme.dangerColor),
            onPressed: () {
              Navigator.pop(ctx);
              setState(() {
                _chats.removeWhere((c) => c.id == chat.id);
                if (_activeChat?.id == chat.id) _activeChat = null;
              });
              _saveChats();
            },
            child: const Text('Eliminar'),
          ),
        ],
      ),
    );
  }

  String _formatTime(DateTime dt) {
    final now = DateTime.now();
    if (dt.year == now.year && dt.month == now.month && dt.day == now.day) {
      return '${dt.hour.toString().padLeft(2, '0')}:${dt.minute.toString().padLeft(2, '0')}';
    }
    return '${dt.day}/${dt.month}';
  }

  List<Map<String, dynamic>> get _usuariosFiltrados {
    final q = _searchCtrl.text.toLowerCase();
    if (q.isEmpty) return _usuarios;
    return _usuarios.where((u) {
      final name = (u['nombre'] ?? '').toString().toLowerCase();
      final email = (u['email'] ?? '').toString().toLowerCase();
      return name.contains(q) || email.contains(q);
    }).toList();
  }

  String _initials(String name) {
    final parts = name.split(' ');
    if (parts.length >= 2) {
      return '${parts[0][0]}${parts[1][0]}'.toUpperCase();
    }
    return name.isNotEmpty ? name[0].toUpperCase() : 'U';
  }
}

// ─── Bottom sheet para nuevo chat / grupo ─────────────────────────
class _NewChatSheet extends StatefulWidget {
  final ScrollController scrollController;
  final List<Map<String, dynamic>> usuarios;
  final String Function(String) initials;
  final void Function(Map<String, dynamic>) onSelectUser;
  final void Function(String) onCreateGroup;

  const _NewChatSheet({
    required this.scrollController,
    required this.usuarios,
    required this.initials,
    required this.onSelectUser,
    required this.onCreateGroup,
  });

  @override
  State<_NewChatSheet> createState() => _NewChatSheetState();
}

class _NewChatSheetState extends State<_NewChatSheet> {
  final _filterCtrl = TextEditingController();
  bool _showGroupForm = false;
  final _groupNameCtrl = TextEditingController();

  List<Map<String, dynamic>> get _filtered {
    final q = _filterCtrl.text.toLowerCase();
    if (q.isEmpty) return widget.usuarios;
    return widget.usuarios.where((u) {
      final name = (u['nombre'] ?? '').toString().toLowerCase();
      final email = (u['email'] ?? '').toString().toLowerCase();
      return name.contains(q) || email.contains(q);
    }).toList();
  }

  @override
  void dispose() {
    _filterCtrl.dispose();
    _groupNameCtrl.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Column(
      children: [
        // Handle
        Container(
          margin: const EdgeInsets.only(top: 10, bottom: 6),
          width: 40,
          height: 4,
          decoration: BoxDecoration(
            color: Colors.grey.shade300,
            borderRadius: BorderRadius.circular(2),
          ),
        ),

        // Título + botón grupo
        Padding(
          padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
          child: Row(
            children: [
              const Text('Nueva conversación',
                  style: TextStyle(fontSize: 17, fontWeight: FontWeight.bold)),
              const Spacer(),
              TextButton.icon(
                onPressed: () => setState(() => _showGroupForm = !_showGroupForm),
                icon: Icon(_showGroupForm ? Icons.person : Icons.group_add, size: 18),
                label: Text(_showGroupForm ? 'Chat' : 'Grupo', style: const TextStyle(fontSize: 13)),
              ),
            ],
          ),
        ),

        // Crear grupo
        if (_showGroupForm)
          Padding(
            padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 4),
            child: Row(
              children: [
                Expanded(
                  child: TextField(
                    controller: _groupNameCtrl,
                    decoration: const InputDecoration(
                      hintText: 'Nombre del grupo',
                      isDense: true,
                      contentPadding: EdgeInsets.symmetric(horizontal: 12, vertical: 10),
                    ),
                  ),
                ),
                const SizedBox(width: 8),
                ElevatedButton(
                  onPressed: () {
                    final name = _groupNameCtrl.text.trim();
                    if (name.isNotEmpty) widget.onCreateGroup(name);
                  },
                  style: ElevatedButton.styleFrom(
                    padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 10),
                  ),
                  child: const Text('Crear'),
                ),
              ],
            ),
          ),

        // Barra de búsqueda
        if (!_showGroupForm)
          Padding(
            padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 4),
            child: SizedBox(
              height: 42,
              child: TextField(
                controller: _filterCtrl,
                onChanged: (_) => setState(() {}),
                style: const TextStyle(fontSize: 14),
                decoration: const InputDecoration(
                  hintText: 'Buscar usuario...',
                  hintStyle: TextStyle(fontSize: 13),
                  prefixIcon: Icon(Icons.search, size: 20),
                  isDense: true,
                  contentPadding: EdgeInsets.symmetric(vertical: 0, horizontal: 12),
                ),
              ),
            ),
          ),

        const SizedBox(height: 4),

        // Lista de usuarios
        if (!_showGroupForm)
          Expanded(
            child: _filtered.isEmpty
                ? const Center(
                    child: Text('No hay usuarios disponibles',
                        style: TextStyle(color: AppTheme.textSecondary)),
                  )
                : ListView.builder(
                    controller: widget.scrollController,
                    itemCount: _filtered.length,
                    itemBuilder: (_, i) {
                      final u = _filtered[i];
                      return ListTile(
                        dense: true,
                        leading: CircleAvatar(
                          radius: 20,
                          backgroundColor: AppTheme.primaryColor,
                          child: Text(
                            widget.initials(u['nombre'] ?? ''),
                            style: const TextStyle(color: Colors.white, fontSize: 13),
                          ),
                        ),
                        title: Text(u['nombre'] ?? '',
                            style: const TextStyle(fontWeight: FontWeight.w600, fontSize: 14)),
                        subtitle: Text(u['email'] ?? '',
                            style: const TextStyle(fontSize: 12)),
                        onTap: () => widget.onSelectUser(u),
                      );
                    },
                  ),
          ),
      ],
    );
  }
}
