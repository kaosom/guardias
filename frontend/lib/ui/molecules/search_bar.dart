import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:lucide_icons/lucide_icons.dart';
import '../../core/theme/app_theme.dart';

class SearchBarWidget extends StatefulWidget {
  final Function(String) onSearch;
  final bool isLoading;
  final String? externalQuery;

  const SearchBarWidget({
    super.key,
    required this.onSearch,
    this.isLoading = false,
    this.externalQuery,
  });

  @override
  State<SearchBarWidget> createState() => _SearchBarWidgetState();
}

class _SearchBarWidgetState extends State<SearchBarWidget> {
  late final TextEditingController _controller;
  final _focusNode = FocusNode();
  bool _focused = false;

  @override
  void initState() {
    super.initState();
    _controller = TextEditingController(text: widget.externalQuery ?? '');
    _focusNode.addListener(
      () => setState(() => _focused = _focusNode.hasFocus),
    );
  }

  @override
  void didUpdateWidget(SearchBarWidget oldWidget) {
    super.didUpdateWidget(oldWidget);
    if (widget.externalQuery != null &&
        widget.externalQuery != _controller.text) {
      _controller.text = widget.externalQuery!;
    }
  }

  @override
  void dispose() {
    _controller.dispose();
    _focusNode.dispose();
    super.dispose();
  }

  void _handleSearch() {
    if (_controller.text.trim().isNotEmpty) {
      _focusNode.unfocus();
      widget.onSearch(_controller.text.trim());
    }
  }

  @override
  Widget build(BuildContext context) {
    final hasText = _controller.text.isNotEmpty;
    final canSearch = hasText && !widget.isLoading;

    return AnimatedContainer(
      duration: const Duration(milliseconds: 180),
      curve: Curves.easeOut,
      height: 52,
      decoration: BoxDecoration(
        color: AppColors.white,
        borderRadius: AppRadius.lg,
        border: Border.all(
          color: _focused ? AppColors.primary : AppColors.slate200,
          width: _focused ? 1.5 : 1,
        ),
        boxShadow: [
          if (_focused)
            BoxShadow(
              color: AppColors.primary.withValues(alpha: 0.10),
              blurRadius: 12,
              offset: const Offset(0, 3),
            )
          else
            BoxShadow(
              color: Colors.black.withValues(alpha: 0.03),
              blurRadius: 6,
              offset: const Offset(0, 2),
            ),
        ],
      ),
      child: Row(
        children: [
          // Search icon
          Padding(
            padding: const EdgeInsets.only(left: 16),
            child: Icon(
              LucideIcons.search,
              size: 16,
              color: _focused ? AppColors.primary : AppColors.slate400,
            ),
          ),

          const SizedBox(width: 12),

          // Text field
          Expanded(
            child: TextField(
              controller: _controller,
              focusNode: _focusNode,
              textCapitalization: TextCapitalization.characters,
              onSubmitted: (_) => _handleSearch(),
              onChanged: (_) => setState(() {}),
              style: GoogleFonts.inter(
                fontSize: 15,
                fontWeight: FontWeight.w500,
                color: AppColors.slate900,
                letterSpacing: 0.3,
              ),
              decoration: InputDecoration(
                hintText: 'Buscar placa o matrícula…',
                hintStyle: GoogleFonts.inter(
                  fontSize: 15,
                  color: AppColors.slate400,
                  fontWeight: FontWeight.w400,
                  letterSpacing: 0,
                ),
                focusedBorder: UnderlineInputBorder(
                  borderSide: BorderSide(color: AppColors.primary),
                ),
                border: UnderlineInputBorder(
                  borderSide: BorderSide(color: AppColors.primary),
                ),
                enabledBorder: UnderlineInputBorder(
                  borderSide: BorderSide(color: AppColors.primary),
                ),
                disabledBorder: UnderlineInputBorder(
                  borderSide: BorderSide(color: AppColors.primary),
                ),
                errorBorder: UnderlineInputBorder(
                  borderSide: BorderSide(color: AppColors.primary),
                ),
                isDense: true,
                contentPadding: EdgeInsets.zero,
                filled: false,
              ),
            ),
          ),

          // Clear button (when text)
          if (hasText && !widget.isLoading)
            GestureDetector(
              onTap: () {
                _controller.clear();
                setState(() {});
              },
              child: const Padding(
                padding: EdgeInsets.symmetric(horizontal: 8),
                child: Icon(LucideIcons.x, size: 14, color: AppColors.slate400),
              ),
            ),

          // Search / Loading action
          Padding(
            padding: const EdgeInsets.only(right: 6),
            child: AnimatedContainer(
              duration: const Duration(milliseconds: 180),
              height: 38,
              width: 38,
              decoration: BoxDecoration(
                color: canSearch ? AppColors.primary : AppColors.slate100,
                borderRadius: AppRadius.md,
              ),
              child: Material(
                color: Colors.transparent,
                child: InkWell(
                  borderRadius: AppRadius.md,
                  onTap: canSearch ? _handleSearch : null,
                  child: Center(
                    child: widget.isLoading
                        ? const SizedBox(
                            width: 16,
                            height: 16,
                            child: CircularProgressIndicator(
                              strokeWidth: 2,
                              color: AppColors.white,
                            ),
                          )
                        : Icon(
                            LucideIcons.arrowRight,
                            size: 16,
                            color: canSearch
                                ? AppColors.white
                                : AppColors.slate300,
                          ),
                  ),
                ),
              ),
            ),
          ),
        ],
      ),
    );
  }
}
