import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../configuracion/theme.dart';
import '../../servicios/auth_service.dart';
import '../../servicios/chat_service.dart';
import '../../componentes/chat_bubble.dart';

class IAChatScreen extends StatefulWidget {
  const IAChatScreen({super.key});

  @override
  State<IAChatScreen> createState() => _IAChatScreenState();
}

class _ChatMsg {
  final bool isUser;
  final String text;
  _ChatMsg({required this.isUser, required this.text});
}

class _IAChatScreenState extends State<IAChatScreen> {
  final _msgCtrl = TextEditingController();
  final _scrollCtrl = ScrollController();
  final List<_ChatMsg> _messages = [];
  bool _sending = false;

  final _quickQuestions = [
    '¿Cuáles son los mejores destinos de Colombia?',
    '¿Qué necesito para viajar a San Andrés?',
    '¿Cuál es la mejor época para visitar el Eje Cafetero?',
    '¿Qué actividades hay en Cartagena?',
  ];

  @override
  void initState() {
    super.initState();
    _messages.add(_ChatMsg(
      isUser: false,
      text: '¡Hola! Soy tu asistente de viajes LawMoon 🌴 ¿En qué puedo ayudarte?',
    ));
  }

  @override
  void dispose() {
    _msgCtrl.dispose();
    _scrollCtrl.dispose();
    super.dispose();
  }

  String get _userInitials =>
      context.read<AuthService>().currentUser?.initials ?? 'US';

  Future<void> _send([String? text]) async {
    final msg = (text ?? _msgCtrl.text).trim();
    if (msg.isEmpty || _sending) return;

    setState(() {
      _messages.add(_ChatMsg(isUser: true, text: msg));
      _sending = true;
    });
    _msgCtrl.clear();
    _scrollToBottom();

    try {
      final reply = await ChatService.sendMessage(msg);
      if (!mounted) return;
      setState(() {
        _messages.add(_ChatMsg(isUser: false, text: reply));
      });
    } catch (e) {
      if (!mounted) return;
      setState(() {
        _messages.add(_ChatMsg(
          isUser: false,
          text: 'No se pudo conectar con el servidor.',
        ));
      });
    } finally {
      if (mounted) setState(() => _sending = false);
      _scrollToBottom();
    }
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
    return Scaffold(
      appBar: AppBar(
        title: const Row(
          mainAxisSize: MainAxisSize.min,
          children: [
            Text('🤖 ', style: TextStyle(fontSize: 20)),
            Text('LawMoon IA'),
          ],
        ),
      ),
      body: Column(
        children: [
          // Messages
          Expanded(
            child: ListView.builder(
              controller: _scrollCtrl,
              padding: const EdgeInsets.symmetric(vertical: 12),
              itemCount: _messages.length + (_sending ? 1 : 0),
              itemBuilder: (_, i) {
                if (i == _messages.length && _sending) {
                  return const ChatBubble(
                    text: 'Escribiendo...',
                    isUser: false,
                  );
                }
                final msg = _messages[i];
                return ChatBubble(
                  text: msg.text,
                  isUser: msg.isUser,
                  avatar: msg.isUser ? _userInitials : '🤖',
                );
              },
            ),
          ),

          // Quick questions
          if (_messages.length <= 1)
            SizedBox(
              height: 42,
              child: ListView.builder(
                scrollDirection: Axis.horizontal,
                padding: const EdgeInsets.symmetric(horizontal: 12),
                itemCount: _quickQuestions.length,
                itemBuilder: (_, i) {
                  return Padding(
                    padding: const EdgeInsets.only(right: 8),
                    child: ActionChip(
                      label: Text(
                        _quickQuestions[i],
                        style: const TextStyle(fontSize: 12),
                      ),
                      onPressed: () => _send(_quickQuestions[i]),
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
                    onSubmitted: (_) => _send(),
                    decoration: const InputDecoration(
                      hintText: 'Pregunta sobre viajes...',
                      border: InputBorder.none,
                      contentPadding: EdgeInsets.symmetric(horizontal: 12),
                    ),
                  ),
                ),
                IconButton(
                  icon: Icon(
                    Icons.send,
                    color: _sending ? Colors.grey : AppTheme.primaryColor,
                  ),
                  onPressed: _sending ? null : () => _send(),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}
