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

  @override
  Widget build(BuildContext context) {
    if (_activeChat != null) {
      return _buildChatView();
    }
    return _buildListView();
  }

  Widget _buildListView() {
    return Scaffold(
      appBar: AppBar(title: const Text('Comunidad')),
      body: Column(
        children: [
          // Buscar usuarios
          Padding(
            padding: const EdgeInsets.all(12),
            child: TextField(
              controller: _searchCtrl,
              onChanged: (_) => setState(() {}),
              decoration: const InputDecoration(
                hintText: 'Buscar usuarios...',
                prefixIcon: Icon(Icons.search),
              ),
            ),
          ),

          // Lista de usuarios para iniciar chat
          if (_searchCtrl.text.isNotEmpty) ...[
            const Padding(
              padding: EdgeInsets.symmetric(horizontal: 16),
              child: Align(
                alignment: Alignment.centerLeft,
                child: Text('Usuarios',
                    style: TextStyle(
                        fontWeight: FontWeight.bold, color: AppTheme.textSecondary)),
              ),
            ),
            SizedBox(
              height: 80,
              child: ListView.builder(
                scrollDirection: Axis.horizontal,
                padding: const EdgeInsets.symmetric(horizontal: 12),
                itemCount: _usuariosFiltrados.length,
                itemBuilder: (_, i) {
                  final u = _usuariosFiltrados[i];
                  return Padding(
                    padding: const EdgeInsets.symmetric(horizontal: 4),
                    child: GestureDetector(
                      onTap: () => _startNewChat(u),
                      child: Column(
                        children: [
                          CircleAvatar(
                            backgroundColor: AppTheme.primaryColor,
                            child: Text(
                              _initials(u['nombre'] ?? ''),
                              style: const TextStyle(
                                  color: Colors.white, fontSize: 14),
                            ),
                          ),
                          const SizedBox(height: 4),
                          SizedBox(
                            width: 60,
                            child: Text(
                              u['nombre'] ?? '',
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
            const Divider(),
          ],

          // Chats existentes
          Expanded(
            child: _chats.isEmpty
                ? const Center(
                    child: Column(
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        Icon(Icons.forum_outlined,
                            size: 64, color: Colors.grey),
                        SizedBox(height: 12),
                        Text('No tienes conversaciones',
                            style: TextStyle(color: AppTheme.textSecondary)),
                        Text('Busca usuarios para iniciar un chat',
                            style: TextStyle(
                                fontSize: 12, color: AppTheme.textSecondary)),
                      ],
                    ),
                  )
                : ListView.separated(
                    itemCount: _chats.length,
                    separatorBuilder: (_, __) => const Divider(height: 1),
                    itemBuilder: (_, i) {
                      final c = _chats[i];
                      return ListTile(
                        leading: CircleAvatar(
                          backgroundColor: c.isGroup
                              ? AppTheme.accentColor
                              : AppTheme.primaryColor,
                          child: c.isGroup
                              ? const Icon(Icons.group, color: Colors.white)
                              : Text(
                                  _initials(c.nombre),
                                  style: const TextStyle(
                                      color: Colors.white, fontSize: 14),
                                ),
                        ),
                        title: Text(c.nombre,
                            style:
                                const TextStyle(fontWeight: FontWeight.w600)),
                        subtitle: Text(c.lastMessage,
                            maxLines: 1, overflow: TextOverflow.ellipsis),
                        onTap: () => _openChat(c),
                      );
                    },
                  ),
          ),
        ],
      ),
    );
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

  Widget _buildChatView() {
    final chat = _activeChat!;
    return Scaffold(
      appBar: AppBar(
        leading: IconButton(
          icon: const Icon(Icons.arrow_back),
          onPressed: () => setState(() => _activeChat = null),
        ),
        title: Row(
          children: [
            CircleAvatar(
              radius: 16,
              backgroundColor: AppTheme.secondaryColor,
              child: Text(
                _initials(chat.nombre),
                style: const TextStyle(color: Colors.white, fontSize: 11),
              ),
            ),
            const SizedBox(width: 10),
            Text(chat.nombre, style: const TextStyle(fontSize: 16)),
          ],
        ),
      ),
      body: Column(
        children: [
          Expanded(
            child: chat.messages.isEmpty
                ? const Center(
                    child: Text('Inicia la conversación',
                        style: TextStyle(color: AppTheme.textSecondary)),
                  )
                : ListView.builder(
                    controller: _scrollCtrl,
                    padding: const EdgeInsets.all(12),
                    itemCount: chat.messages.length,
                    itemBuilder: (_, i) {
                      final msg = chat.messages[i];
                      final isMe = msg.senderId == _userId;
                      return Align(
                        alignment:
                            isMe ? Alignment.centerRight : Alignment.centerLeft,
                        child: Container(
                          margin: const EdgeInsets.symmetric(vertical: 3),
                          padding: const EdgeInsets.symmetric(
                              horizontal: 14, vertical: 9),
                          constraints: BoxConstraints(
                            maxWidth: MediaQuery.of(context).size.width * 0.75,
                          ),
                          decoration: BoxDecoration(
                            color: isMe
                                ? AppTheme.primaryColor
                                : Colors.white,
                            borderRadius: BorderRadius.only(
                              topLeft: const Radius.circular(14),
                              topRight: const Radius.circular(14),
                              bottomLeft: Radius.circular(isMe ? 14 : 2),
                              bottomRight: Radius.circular(isMe ? 2 : 14),
                            ),
                            boxShadow: [
                              BoxShadow(
                                color: Colors.black.withAlpha(10),
                                blurRadius: 3,
                              ),
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
                                  color: isMe
                                      ? Colors.white
                                      : AppTheme.textPrimary,
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
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
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
                    decoration: const InputDecoration(
                      hintText: 'Escribe un mensaje...',
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
        ],
      ),
    );
  }

  String _initials(String name) {
    final parts = name.split(' ');
    if (parts.length >= 2) {
      return '${parts[0][0]}${parts[1][0]}'.toUpperCase();
    }
    return name.isNotEmpty ? name[0].toUpperCase() : 'U';
  }
}
