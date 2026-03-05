import 'package:go_router/go_router.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../features/home/presentation/home_screen.dart';
import '../../features/auth/presentation/login_screen.dart';
import '../../features/admin/presentation/admin_screen.dart';
import '../../features/auth/data/auth_repository.dart';

final routerProvider = Provider<GoRouter>((ref) {
  final authState = ref.watch(authProvider);

  return GoRouter(
    initialLocation: '/',
    redirect: (context, state) {
      if (authState.isLoading) return null;
      
      final isLoggingIn = state.uri.path == '/login';
      final isLoggedIn = authState.user != null;

      if (!isLoggedIn && !isLoggingIn) return '/login';
      if (isLoggedIn && isLoggingIn) return '/';
      
      // Admin protection
      if (state.uri.path.startsWith('/admin') && authState.user?.role != 'admin') {
        return '/';
      }

      return null;
    },
    routes: [
      GoRoute(
        path: '/login',
        builder: (context, state) => const LoginScreen(),
      ),
      GoRoute(
        path: '/',
        builder: (context, state) => const HomeScreen(),
      ),
      GoRoute(
        path: '/admin',
        builder: (context, state) => const AdminScreen(),
      ),
    ],
  );
});
