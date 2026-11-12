// src/services/offlineSync.ts
import { sqliteStorage as AsyncStorage } from '../data/datasources/local/sqliteStorage'; 
import NetInfo from '@react-native-community/netinfo';
import api from '../data/datasources/remote/api';

const QUEUE_KEY = '@offline_request_queue';

type QueueItem = {
  id: string;
  method: 'POST' | 'PUT' | 'DELETE';
  url: string;
  data: any;
};

// 🌟 Cơ chế phát tín hiệu (Event Emitter)
type SyncListener = () => void;
let syncListeners: SyncListener[] = [];
export const onOfflineSyncCompleted = (callback: SyncListener) => {
  syncListeners.push(callback);
  return () => { syncListeners = syncListeners.filter(cb => cb !== callback); };
};

export const addToOfflineQueue = async (method: 'POST' | 'PUT' | 'DELETE', url: string, data: any) => {
  try {
    const queueStr = await AsyncStorage.getItem(QUEUE_KEY);
    const queue: QueueItem[] = queueStr ? JSON.parse(queueStr) : [];
    queue.push({ id: Date.now().toString(), method, url, data });
    await AsyncStorage.setItem(QUEUE_KEY, JSON.stringify(queue));
    console.log(`[Offline] Đã lưu request: ${method} ${url}`);
  } catch (error) {
    console.log('Lỗi lưu offline queue:', error);
  }
};

export const syncOfflineData = async () => {
  const state = await NetInfo.fetch();
  if (!state.isConnected) return;

  try {
    const queueStr = await AsyncStorage.getItem(QUEUE_KEY);
    if (!queueStr) return;
    
    let queue: QueueItem[] = JSON.parse(queueStr);
    if (queue.length === 0) return;

    console.log(`[Offline] Bắt đầu đồng bộ ${queue.length} request...`);
    const failedQueue: QueueItem[] = [];
    let hasSyncedOrders = false;

    for (const item of queue) {
      try {
        if (item.method === 'POST') await api.post(item.url, item.data);
        else if (item.method === 'PUT') await api.put(item.url, item.data);
        else if (item.method === 'DELETE') await api.delete(item.url);
        
        if (item.url.includes('/api/orders')) hasSyncedOrders = true;
      } catch (error: any) {
        // 🌟 Nếu Server trả về lỗi 4xx (VD: 400 Đơn hàng đã giao không thể hủy)
        if (error.response && error.response.status >= 400 && error.response.status < 500) {
          console.log(`[Offline] Server từ chối thao tác (Lỗi logic): ${item.url}. Xóa khỏi hàng đợi.`);
          if (item.url.includes('/api/orders')) hasSyncedOrders = true; 
          // Không push vào failedQueue -> Tự động bị xóa
        } else {
          // Lỗi mạng hoặc lỗi 500 (Server sập) -> Giữ lại để thử tiếp
          console.log(`[Offline] Đồng bộ thất bại: ${item.url}`, error);
          failedQueue.push(item);
        }
      }
    }

    await AsyncStorage.setItem(QUEUE_KEY, JSON.stringify(failedQueue));
    
    if (hasSyncedOrders) {
      console.log('[Offline] Đã đồng bộ xong đơn hàng, phát tín hiệu reload UI!');
      syncListeners.forEach(callback => callback());
    }
  } catch (error) {
    console.log('Lỗi đồng bộ offline:', error);
  }
};

export const setupNetworkListener = () => {
  NetInfo.addEventListener(state => {
    if (state.isConnected && state.isInternetReachable) {
      console.log('[Network] Có kết nối mạng, kiểm tra đồng bộ...');
      syncOfflineData();
    }
  });
};