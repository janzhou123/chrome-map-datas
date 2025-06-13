'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Search, MapPin, Download, Loader2, FileSpreadsheet, Key } from 'lucide-react';
import toast from 'react-hot-toast';
import { searchGoogleMaps, exportPlacesData, exportAllDataToExcel } from '@/lib/api';
import { GoogleMapsPlace, GoogleMapsSearchResponse } from '@/types';

export default function HomePage() {
  const router = useRouter();
  const [keyword, setKeyword] = useState('Chinese medicine');
  const [location, setLocation] = useState('US');
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState<GoogleMapsPlace[]>([]);
  const [hasSearched, setHasSearched] = useState(false);
  
  // API_KEY 相关状态
  const [apiKey, setApiKey] = useState<string>('');
  const [showApiKeyModal, setShowApiKeyModal] = useState(false);
  const [tempApiKey, setTempApiKey] = useState('');
  
  // 页面加载时恢复搜索结果和API_KEY
  useEffect(() => {
    const savedResults = localStorage.getItem('searchResults');
    const savedKeyword = localStorage.getItem('searchKeyword');
    const savedLocation = localStorage.getItem('searchLocation');
    const savedApiKey = localStorage.getItem('serpapi_api_key');
    
    if (savedResults) {
      try {
        const results = JSON.parse(savedResults);
        setSearchResults(results);
        setHasSearched(true);
      } catch (error) {
        console.error('恢复搜索结果失败:', error);
      }
    }
    
    // 如果有保存的关键词和区域，则使用保存的值，否则保持默认值
    if (savedKeyword) setKeyword(savedKeyword);
    if (savedLocation) setLocation(savedLocation);
    
    // 恢复 API_KEY，如果没有则显示设置弹窗
    if (savedApiKey) {
      setApiKey(savedApiKey);
    } else {
      // 如果没有保存的API_KEY，自动显示设置弹窗
      setShowApiKeyModal(true);
      toast('请设置您的 SerpAPI API_KEY 以使用搜索功能');
    }
  }, []);

  // API_KEY 管理相关函数
  const handleOpenApiKeyModal = () => {
    setTempApiKey(apiKey);
    setShowApiKeyModal(true);
  };
  
  const handleCloseApiKeyModal = () => {
    setShowApiKeyModal(false);
  };
  
  const handleSaveApiKey = () => {
    setApiKey(tempApiKey);
    localStorage.setItem('serpapi_api_key', tempApiKey);
    setShowApiKeyModal(false);
    toast.success('API_KEY 已保存');
  };

  const handleClearApiKey = () => {
    setApiKey('');
    setTempApiKey('');
    localStorage.removeItem('serpapi_api_key');
    toast.success('API_KEY 已清空');
    setShowApiKeyModal(false);
  };
  
  const handleSearch = async () => {
    if (!keyword.trim() || !location.trim()) {
      toast.error('请输入关键词和区域');
      return;
    }
    
    if (!apiKey) {
      toast.error('请先设置 API_KEY');
      handleOpenApiKeyModal();
      return;
    }

    setIsSearching(true);
    try {
      // 使用 API_KEY 进行搜索
      const response = await searchGoogleMaps(
        keyword.trim(), 
        location.trim(), 
        apiKey
      );
      
      const places = response.local_results || [];
      setSearchResults(places);
      setHasSearched(true);
      
      // 保存搜索结果和搜索条件到 localStorage
      localStorage.setItem('searchResults', JSON.stringify(places));
      localStorage.setItem('searchKeyword', keyword.trim());
      localStorage.setItem('searchLocation', location.trim());
      
      if (places.length === 0) {
        toast.error('未找到相关地点，请尝试其他关键词或区域');
      } else {
        toast.success(`找到 ${places.length} 个地点`);
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : '搜索失败');
    } finally {
      setIsSearching(false);
    }
  };

  const handleExport = () => {
    if (searchResults.length === 0) {
      toast.error('没有数据可导出');
      return;
    }
    
    try {
      exportPlacesData(searchResults);
      toast.success('数据导出成功');
    } catch (error) {
      toast.error('导出失败');
    }
  };

  const handleExportAll = async () => {
    if (searchResults.length === 0) {
      toast.error('没有数据可导出');
      return;
    }
    
    const loadingToast = toast.loading('正在导出全部数据，请稍候...');
    
    try {
      const result = await exportAllDataToExcel(searchResults);
      toast.dismiss(loadingToast);
      toast.success(`导出成功：${result.placesCount} 个地点，${result.reviewsCount} 条评论`);
    } catch (error) {
      toast.dismiss(loadingToast);
      toast.error(error instanceof Error ? error.message : '导出失败');
    }
  };

  const viewPlaceDetails = (place: GoogleMapsPlace) => {
    // 将地点数据存储到 localStorage 以便在详情页使用
    localStorage.setItem('currentPlace', JSON.stringify(place));
    router.push(`/place/${place.place_id}`);
  };

  return (
    <div className="space-y-8">
      {/* 搜索区域 */}
      <div className="card">
        <h2 className="text-xl font-semibold mb-6 text-gray-800">
          地图搜索
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              关键词
            </label>
            <input
              type="text"
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              placeholder="例如：餐厅、咖啡店、酒店"
              className="input"
              onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              区域
            </label>
            <input
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="例如：北京市朝阳区、上海市浦东新区"
              className="input"
              onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
            />
          </div>
        </div>
        
        <div className="flex flex-wrap gap-2">
          <button
            onClick={handleSearch}
            disabled={isSearching}
            className="btn btn-primary flex items-center gap-2"
          >
            {isSearching ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Search className="w-4 h-4" />
            )}
            {isSearching ? '搜索中...' : '搜索'}
          </button>
          
          <button
            onClick={handleOpenApiKeyModal}
            className="btn btn-secondary flex items-center gap-2"
          >
            <Key className="w-4 h-4" />
            {apiKey ? '修改 API_KEY' : '设置 API_KEY'}
          </button>
          
          {hasSearched && searchResults.length > 0 && (
            <>
              {/* <button
                onClick={handleExport}
                className="btn btn-secondary flex items-center gap-2"
              >
                <Download className="w-4 h-4" />
                导出数据
              </button> */}
              
              <button
                onClick={handleExportAll}
                className="btn btn-secondary flex items-center gap-2"
              >
                <FileSpreadsheet className="w-4 h-4" />
                导出数据
              </button>
            </>
          )}
        </div>
      </div>

      {/* 搜索结果 */}
      {hasSearched && (
        <div className="card">
          <h2 className="text-xl font-semibold mb-6 text-gray-800">
            搜索结果 ({searchResults.length} 个地点)
          </h2>
          
          {searchResults.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <MapPin className="w-12 h-12 mx-auto mb-4 text-gray-300" />
              <p>未找到相关地点</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {searchResults.map((place, index) => (
                <div
                  key={place.place_id || index}
                  className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer"
                  onClick={() => viewPlaceDetails(place)}
                >
                  {place.thumbnail && (
                    <img
                      src={place.thumbnail}
                      alt={place.title}
                      className="w-full h-32 object-cover rounded-md mb-3"
                    />
                  )}
                  
                  <h3 className="font-semibold text-gray-900 mb-2">
                    {place.title}
                  </h3>
                  
                  <p className="text-sm text-gray-600 mb-2">
                    {place.address}
                  </p>
                  
                  <div className="flex items-center justify-between text-sm">
                    {place.rating && (
                      <span className="text-yellow-600">
                        ⭐ {place.rating}
                      </span>
                    )}
                    
                    {place.reviews && (
                      <span className="text-gray-500">
                        {place.reviews} 条评论
                      </span>
                    )}
                  </div>
                  
                  {place.type && (
                    <span className="inline-block mt-2 px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded">
                      {place.type}
                    </span>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
      
      {/* API_KEY 管理弹窗 */}
      {showApiKeyModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-semibold mb-4">设置 SerpAPI API_KEY</h2>
            
            <p className="text-gray-600 mb-4">
              请输入您的 SerpAPI API_KEY。如果您没有 API_KEY，可以在 
              <a 
                href="https://serpapi.com/" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-blue-600 hover:underline"
              >
                SerpAPI 官网
              </a> 
              注册获取。
            </p>
            
            <div className="mb-4">
              <label htmlFor="apiKey" className="block text-sm font-medium text-gray-700 mb-1">
                API_KEY
              </label>
              <input
                type="text"
                id="apiKey"
                value={tempApiKey}
                onChange={(e) => setTempApiKey(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="输入您的 SerpAPI API_KEY"
              />
            </div>
            
            <div className="flex justify-end gap-2">
              <button
                onClick={handleCloseApiKeyModal}
                className="btn btn-secondary"
              >
                取消
              </button>
              {apiKey && (
                <button
                  onClick={handleClearApiKey}
                  className="btn btn-danger"
                >
                  清空
                </button>
              )}
              <button
                onClick={handleSaveApiKey}
                disabled={!tempApiKey.trim()}
                className="btn btn-primary"
              >
                保存
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}