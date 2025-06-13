import axios from 'axios';
import { GoogleMapsSearchResponse, GoogleMapsReviewsResponse, GoogleMapsPlace, GoogleMapsReview } from '@/types';
import * as XLSX from 'xlsx';

// Google Maps 搜索 API
export const searchGoogleMaps = async (
  keyword: string, 
  location: string, 
  api_key?: string
): Promise<GoogleMapsSearchResponse> => {
  try {
    const params: any = {
      keyword,
      location
    };
    
    // 添加 API_KEY 参数
    if (api_key) {
      params.api_key = api_key;
    }
    
    const response = await axios.get('/api/search', { params });
    
    return response.data;
  } catch (error) {
    console.error('Google Maps 搜索失败:', error);
    throw new Error('搜索失败，请检查网络连接或稍后重试');
  }
};

// Google Maps 评论 API
export const getGoogleMapsReviews = async (data_id: string, next_page_token?: string): Promise<GoogleMapsReviewsResponse> => {
  try {
    const params: any = { data_id };
    if (next_page_token) {
      params.next_page_token = next_page_token;
    }
    
    const response = await axios.get('/api/reviews', { params });
    
    return response.data;
  } catch (error) {
    console.error('获取评论失败:', error);
    throw new Error('获取评论失败，请稍后重试');
  }
};

// 导出数据为 CSV 格式
export const exportToCSV = (data: any[], filename: string) => {
  if (data.length === 0) {
    throw new Error('没有数据可导出');
  }

  // 获取所有键作为表头
  const headers = Object.keys(data[0]);
  
  // 创建 CSV 内容
  const csvContent = [
    headers.join(','), // 表头
    ...data.map(row => 
      headers.map(header => {
        const value = row[header];
        // 处理包含逗号、换行符或引号的值
        if (typeof value === 'string' && (value.includes(',') || value.includes('\n') || value.includes('"'))) {
          return `"${value.replace(/"/g, '""')}"`;
        }
        return value || '';
      }).join(',')
    )
  ].join('\n');

  // 创建下载链接
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  
  link.setAttribute('href', url);
  link.setAttribute('download', `${filename}.csv`);
  link.style.visibility = 'hidden';
  
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

// 导出地图点数据
export const exportPlacesData = (places: any[]) => {
  const exportData = places.map(place => ({
    '名称': place.title || '',
    '地址': place.address || '',
    '电话': place.phone || '',
    '网站': place.website || '',
    '评分': place.rating || '',
    '评论数': place.reviews || '',
    '类型': place.type || '',
    '营业时间': place.hours || '',
    '纬度': place.gps_coordinates?.latitude || '',
    '经度': place.gps_coordinates?.longitude || '',
    'Place ID': place.place_id || ''
  }));
  
  exportToCSV(exportData, `地图点数据_${new Date().toISOString().split('T')[0]}`);
};

// 导出评论数据
export const exportReviewsData = (reviews: any[], placeName: string) => {
  const exportData = reviews.map(review => ({
    '地点名称': placeName,
    '用户名': review.user?.name || '',
    '评分': review.rating || '',
    '日期': review.date || '',
    '评论内容': review.snippet || '',
    '点赞数': review.likes || '',
    '用户评论数': review.user?.reviews || '',
    '用户照片数': review.user?.photos || ''
  }));
  
  exportToCSV(exportData, `${placeName}_评论数据_${new Date().toISOString().split('T')[0]}`);
};

// 导出地图点和评论数据到Excel（两个sheet）
export const exportAllDataToExcel = async (places: GoogleMapsPlace[]) => {
  if (places.length === 0) {
    throw new Error('没有地图点数据可导出');
  }

  // 准备地图点数据
  const placesData = places.map(place => ({
    '名称': place.title || '',
    '地址': place.address || '',
    '电话': place.phone || '',
    '网站': place.website || '',
    '评分': place.rating || '',
    '评论数': place.reviews || '',
    '类型': place.type || '',
    '营业时间': place.hours || '',
    '纬度': place.gps_coordinates?.latitude || '',
    '经度': place.gps_coordinates?.longitude || '',
    'Place ID': place.place_id || '',
    'Data ID': place.data_id || ''
  }));

  // 创建工作簿
  const workbook = XLSX.utils.book_new();
  
  // 添加地图点数据sheet
  const placesSheet = XLSX.utils.json_to_sheet(placesData);
  XLSX.utils.book_append_sheet(workbook, placesSheet, '地图点数据');
  
  // 收集所有评论数据
  const allReviews: any[] = [];
  
  // 递归获取所有评论页面的函数
  const fetchAllReviewsForPlace = async (place: GoogleMapsPlace, nextPageToken?: string, allPlaceReviews: any[] = []) => {
    try {
      if (place.data_id || place.place_id) {
        const reviewsData = await getGoogleMapsReviews(place.data_id || place.place_id, nextPageToken);
        
        if (reviewsData && reviewsData.reviews && Array.isArray(reviewsData.reviews)) {
          // 将评论与地点关联
          const placeReviews = reviewsData.reviews.map(review => ({
            '地点名称': place.title || '',
            '地点ID': place.place_id || '',
            '用户名': review.user?.name || '',
            '评分': review.rating || '',
            '日期': review.date || '',
            '评论内容': review.snippet || '',
            '点赞数': review.likes || '',
            '用户评论数': review.user?.reviews || '',
            '用户照片数': review.user?.photos || ''
          }));
          
          allPlaceReviews.push(...placeReviews);
          
          // 如果有下一页，递归获取
          if (reviewsData.serpapi_pagination?.next_page_token) {
            // 添加短暂延迟，避免API限制
            await new Promise(resolve => setTimeout(resolve, 300));
            return fetchAllReviewsForPlace(place, reviewsData.serpapi_pagination.next_page_token, allPlaceReviews);
          }
        }
      }
      return allPlaceReviews;
    } catch (error) {
      console.error(`获取地点 ${place.title} 的评论失败:`, error);
      // 返回已获取的评论，不中断整个过程
      return allPlaceReviews;
    }
  };

  // 为每个地点获取评论数据
  for (const place of places) {
    const placeReviews = await fetchAllReviewsForPlace(place);
    allReviews.push(...placeReviews);
  }
  
  // 添加评论数据sheet
  if (allReviews.length > 0) {
    const reviewsSheet = XLSX.utils.json_to_sheet(allReviews);
    XLSX.utils.book_append_sheet(workbook, reviewsSheet, '评论数据');
  }
  
  // 导出Excel文件
  const fileName = `地图数据_${new Date().toISOString().split('T')[0]}.xlsx`;
  XLSX.writeFile(workbook, fileName);
  
  return { placesCount: places.length, reviewsCount: allReviews.length };
};