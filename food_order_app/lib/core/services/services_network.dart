import 'dart:async';
import 'package:connectivity_plus/connectivity_plus.dart';
import 'package:flutter/material.dart';
import 'package:http/http.dart' as http;

import '../constants/app_colors.dart';

enum NetworkStatus { good, medium, poor, offline }

class NetworkService {
  NetworkService._();

  static final NetworkService _instance = NetworkService._();
  static NetworkService get instance => _instance;

  final Connectivity _connectivity = Connectivity();
  final StreamController<NetworkStatus> _statusController = StreamController<NetworkStatus>.broadcast();
  
  Stream<NetworkStatus> get statusStream => _statusController.stream;
  NetworkStatus _currentStatus = NetworkStatus.offline;
  bool _isChecking = false;
  
  GlobalKey<ScaffoldMessengerState>? _scaffoldMessengerKey;

  void initialize(GlobalKey<ScaffoldMessengerState> key) {
    _scaffoldMessengerKey = key;
    
    _connectivity.onConnectivityChanged.listen((List<ConnectivityResult> results) {
      if (results.contains(ConnectivityResult.none)) {
        _updateStatus(NetworkStatus.offline);
      } else {
        _checkLatency();
      }
    });
    
    // Initial check
    _connectivity.checkConnectivity().then((results) {
       if (results.contains(ConnectivityResult.none)) {
        _updateStatus(NetworkStatus.offline);
      } else {
        _checkLatency();
      }
    });
  }

  Future<void> _checkLatency() async {
    if (_isChecking) return;
    _isChecking = true;
    
    final stopwatch = Stopwatch()..start();
    try {
      final response = await http.get(Uri.parse('http://clients3.google.com/generate_204')).timeout(const Duration(seconds: 3));
      stopwatch.stop();
      
      if (response.statusCode == 204 || response.statusCode == 200) {
        final latency = stopwatch.elapsedMilliseconds;
        if (latency < 150) {
          _updateStatus(NetworkStatus.good);
        } else if (latency < 500) {
          _updateStatus(NetworkStatus.medium);
        } else {
          _updateStatus(NetworkStatus.poor);
        }
      } else {
        _updateStatus(NetworkStatus.offline);
      }
    } catch (e) {
      _updateStatus(NetworkStatus.offline);
    } finally {
      _isChecking = false;
    }
  }

  void _updateStatus(NetworkStatus newStatus) {
    if (_currentStatus != newStatus) {
      _currentStatus = newStatus;
      _statusController.add(newStatus);
      _showNetworkSnackbar(newStatus);
    }
  }

  void _showNetworkSnackbar(NetworkStatus status) {
    if (_scaffoldMessengerKey?.currentState == null) return;
    
    String message;
    Color color;
    IconData icon;

    switch (status) {
      case NetworkStatus.good:
        message = 'Excellent Connection';
        color = AppColors.tertiary; // Green
        icon = Icons.wifi;
        break;
      case NetworkStatus.medium:
        message = 'Slow Connection';
        color = AppColors.secondary; // Amber
        icon = Icons.wifi_2_bar;
        break;
      case NetworkStatus.poor:
        message = 'Poor Connection';
        color = AppColors.primary; // Orange
        icon = Icons.wifi_1_bar;
        break;
      case NetworkStatus.offline:
        message = 'No Internet Connection';
        color = Colors.red;
        icon = Icons.wifi_off;
        break;
    }

    _scaffoldMessengerKey!.currentState!
      ..hideCurrentSnackBar()
      ..showSnackBar(
        SnackBar(
          content: Row(
            children: [
              Icon(icon, color: Colors.white, size: 20),
              const SizedBox(width: 12),
              Text(message, style: const TextStyle(color: Colors.white, fontWeight: FontWeight.bold)),
            ],
          ),
          backgroundColor: color,
          behavior: SnackBarBehavior.floating,
          margin: const EdgeInsets.all(16),
          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
          duration: const Duration(seconds: 3),
        ),
      );
  }

  void dispose() {
    _statusController.close();
  }
}
