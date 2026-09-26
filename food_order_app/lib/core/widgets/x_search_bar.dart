import 'package:flutter/material.dart';
import '../constants/app_colors.dart';

class XSearchBar extends StatefulWidget {
  final TextEditingController? controller;
  final ValueChanged<String>? onChanged;
  final String? hintText;
  final bool readOnly;
  final VoidCallback? onTap;

  const XSearchBar({
    super.key,
    this.controller,
    this.onChanged,
    this.hintText,
    this.readOnly = false,
    this.onTap,
  });

  @override
  State<XSearchBar> createState() => _XSearchBarState();
}

class _XSearchBarState extends State<XSearchBar> {
  late TextEditingController _controller;
  bool _isInternalController = false;
  late final ValueNotifier<bool> _hasText;

  @override
  void initState() {
    super.initState();
    if (widget.controller != null) {
      _controller = widget.controller!;
    } else {
      _controller = TextEditingController();
      _isInternalController = true;
    }
    _hasText = ValueNotifier<bool>(_controller.text.isNotEmpty);
    _controller.addListener(_textListener);
  }

  @override
  void didUpdateWidget(covariant XSearchBar oldWidget) {
    super.didUpdateWidget(oldWidget);
    if (oldWidget.controller != widget.controller) {
      oldWidget.controller?.removeListener(_textListener);
      if (_isInternalController) {
        _controller.dispose();
        _isInternalController = false;
      }
      if (widget.controller != null) {
        _controller = widget.controller!;
      } else {
        _controller = TextEditingController();
        _isInternalController = true;
      }
      _hasText.value = _controller.text.isNotEmpty;
      _controller.addListener(_textListener);
    }
  }

  void _textListener() {
    final has = _controller.text.isNotEmpty;
    if (_hasText.value != has) {
      _hasText.value = has;
    }
  }

  @override
  void dispose() {
    _controller.removeListener(_textListener);
    if (_isInternalController) {
      _controller.dispose();
    }
    _hasText.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;

    final bgColor = isDark ? const Color(0xFF1E2638) : const Color(0xFFF4F1EE);
    final borderColor = isDark
        ? Colors.white.withValues(alpha: 0.08)
        : AppColors.primary.withValues(alpha: 0.12);
    final iconColor = isDark ? Colors.white38 : const Color(0xFF9E8E82);
    final hintColor = isDark ? Colors.white30 : const Color(0xFFA49589);
    final textColor = isDark ? Colors.white : AppColors.neutral;

    return Container(
      height: 48,
      decoration: BoxDecoration(
        color: bgColor,
        borderRadius: BorderRadius.circular(14),
        border: Border.all(color: borderColor, width: 1),
      ),
      child: Row(
        children: [
          const SizedBox(width: 14),
          ValueListenableBuilder<bool>(
            valueListenable: _hasText,
            builder: (context, hasText, _) {
              return Icon(
                Icons.search_rounded,
                color: hasText ? AppColors.primary : iconColor,
                size: 22,
              );
            },
          ),
          const SizedBox(width: 10),
          Expanded(
            child: TextField(
              controller: _controller,
              readOnly: widget.readOnly,
              onTap: widget.onTap,
              onChanged: (value) {
                widget.onChanged?.call(value);
              },
              decoration: InputDecoration(
                hintText: widget.hintText ?? 'Search food, drinks...',
                hintStyle: TextStyle(
                  color: hintColor,
                  fontSize: 15,
                  fontWeight: FontWeight.w400,
                ),
                border: InputBorder.none,
                enabledBorder: InputBorder.none,
                focusedBorder: InputBorder.none,
                filled: false,
                isDense: true,
                contentPadding: EdgeInsets.zero,
              ),
              style: TextStyle(
                color: textColor,
                fontSize: 15,
                fontWeight: FontWeight.w500,
              ),
            ),
          ),
          // Clear button — appears when typing
          ValueListenableBuilder<bool>(
            valueListenable: _hasText,
            builder: (context, hasText, _) {
              return AnimatedSwitcher(
                duration: const Duration(milliseconds: 200),
                transitionBuilder: (child, animation) => FadeTransition(
                  opacity: animation,
                  child: ScaleTransition(scale: animation, child: child),
                ),
                child: hasText
                    ? GestureDetector(
                        key: const ValueKey('clear'),
                        onTap: () {
                          _controller.clear();
                          widget.onChanged?.call('');
                        },
                        child: Padding(
                          padding: const EdgeInsets.only(right: 12),
                          child: Container(
                            width: 24,
                            height: 24,
                            decoration: BoxDecoration(
                              color: isDark
                                  ? Colors.white.withValues(alpha: 0.1)
                                  : Colors.black.withValues(alpha: 0.06),
                              shape: BoxShape.circle,
                            ),
                            child: Icon(
                              Icons.close_rounded,
                              size: 14,
                              color: isDark
                                  ? Colors.white54
                                  : AppColors.subtitleColor,
                            ),
                          ),
                        ),
                      )
                    : const SizedBox.shrink(key: ValueKey('empty')),
              );
            },
          ),
        ],
      ),
    );
  }
}
