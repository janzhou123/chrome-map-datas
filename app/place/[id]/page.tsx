'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { ArrowLeft, Star, Download, Loader2, MapPin, Phone, Globe, Clock } from 'lucide-react';
import toast from 'react-hot-toast';
import { getGoogleMapsReviews, exportReviewsData } from '@/lib/api';
import { GoogleMapsPlace, GoogleMapsReview } from '@/types';

export default function PlaceDetailPage() {
  const router = useRouter();
  const params = useParams();
  const [place, setPlace] = useState<GoogleMapsPlace | null>(null);
  const [reviews, setReviews] = useState<GoogleMapsReview[]>([]);
  const [isLoadingReviews, setIsLoadingReviews] = useState(false);
  const [hasLoadedReviews, setHasLoadedReviews] = useState(false);
  const [nextPageToken, setNextPageToken] = useState<string | null>(null);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [hasMoreReviews, setHasMoreReviews] = useState(true);

  useEffect(() => {
    // 从 localStorage 获取地点数据
    const storedPlace = localStorage.getItem('currentPlace');
    if (storedPlace) {
      setPlace(JSON.parse(storedPlace));
    } else {
      toast.error('未找到地点信息');
      router.push('/');
    }
  }, [router]);





  const loadReviews = async (isLoadMore = false) => {
    if (!place || (isLoadingReviews && !isLoadMore) || (isLoadMore && isLoadingMore)) return;
    
    if (isLoadMore) {
      setIsLoadingMore(true);
    } else {
      setIsLoadingReviews(true);
    }
    
    try {
      const token = isLoadMore ? nextPageToken : undefined;
      const reviewsData = await getGoogleMapsReviews(place.data_id || place.place_id, token || undefined);
      
      console.log('API返回完整数据:', reviewsData);
      
      // 确保reviews字段是数组
      if (!reviewsData || !reviewsData.reviews) {
        throw new Error('API返回数据格式错误');
      }
      
      // 处理评论数据
      const reviewsList = Array.isArray(reviewsData.reviews) ? reviewsData.reviews : [];
      console.log('处理后的评论列表:', reviewsList);
      console.log('评论数量:', reviewsList.length);
      
      if (isLoadMore) {
        // 追加新评论 - 使用函数式更新确保基于最新状态
        setReviews(prevReviews => {
          // 确保prevReviews是数组
          const currentReviews = Array.isArray(prevReviews) ? prevReviews : [];
          const newReviews = [...currentReviews, ...reviewsList];
          console.log('追加后的评论列表长度:', newReviews.length);
          return newReviews;
        });
      } else {
        // 初次加载 - 直接设置评论
        console.log('设置初始评论列表:', reviewsList);
        setReviews(reviewsList);
      }
      
      // 无论是初次加载还是加载更多，都设置hasLoadedReviews为true
      setHasLoadedReviews(true);
      
      // 更新分页token
      setNextPageToken(reviewsData.serpapi_pagination?.next_page_token || null);
      setHasMoreReviews(!!reviewsData.serpapi_pagination?.next_page_token);
      
      // 显示提示消息
      if (!isLoadMore) {
        if (reviewsList.length === 0) {
          toast.error('该地点暂无评论');
        } else {
          toast.success(`加载了 ${reviewsList.length} 条评论`);
        }
      } else if (reviewsList.length > 0) {
        toast.success(`加载了 ${reviewsList.length} 条新评论`);
      }
    } catch (error) {
      console.error('加载评论错误:', error);
      toast.error(error instanceof Error ? error.message : '加载评论失败');
    } finally {
      if (isLoadMore) {
        setIsLoadingMore(false);
      } else {
        setIsLoadingReviews(false);
      }
    }
  };

  const handleExportReviews = async () => {
    if (!place) {
      toast.error('地点信息不存在');
      return;
    }
    
    // 显示加载提示
    toast.loading('正在获取所有评论数据，请稍候...');
    
    try {
      // 如果已经加载了评论但还有更多页面，则继续获取所有页面
      let allReviews = [...reviews];
      let currentToken = nextPageToken;
      
      // 如果有下一页且已经加载了初始评论，则继续获取所有页面
      while (currentToken && hasLoadedReviews) {
        // 显示正在加载更多页面
        toast.loading(`正在获取更多评论数据，已获取 ${allReviews.length} 条...`);
        
        try {
          const moreReviewsData = await getGoogleMapsReviews(place.data_id || place.place_id, currentToken);
          
          if (moreReviewsData && Array.isArray(moreReviewsData.reviews)) {
            allReviews = [...allReviews, ...moreReviewsData.reviews];
            currentToken = moreReviewsData.serpapi_pagination?.next_page_token || null;
          } else {
            currentToken = null;
          }
          
          // 添加短暂延迟，避免API限制
          await new Promise(resolve => setTimeout(resolve, 300));
        } catch (error) {
          console.error('获取更多评论失败:', error);
          break; // 出错时停止获取，使用已获取的评论
        }
      }
      
      // 如果没有加载过评论，则先加载第一页
      if (!hasLoadedReviews && allReviews.length === 0) {
        toast.loading('正在获取初始评论数据...');
        
        try {
          const initialReviewsData = await getGoogleMapsReviews(place.data_id || place.place_id);
          
          if (initialReviewsData && Array.isArray(initialReviewsData.reviews)) {
            allReviews = initialReviewsData.reviews;
            currentToken = initialReviewsData.serpapi_pagination?.next_page_token || null;
            
            // 继续获取所有页面
            while (currentToken) {
              toast.loading(`正在获取更多评论数据，已获取 ${allReviews.length} 条...`);
              
              try {
                const moreReviewsData = await getGoogleMapsReviews(place.data_id || place.place_id, currentToken);
                
                if (moreReviewsData && Array.isArray(moreReviewsData.reviews)) {
                  allReviews = [...allReviews, ...moreReviewsData.reviews];
                  currentToken = moreReviewsData.serpapi_pagination?.next_page_token || null;
                } else {
                  currentToken = null;
                }
                
                // 添加短暂延迟，避免API限制
                await new Promise(resolve => setTimeout(resolve, 300));
              } catch (error) {
                console.error('获取更多评论失败:', error);
                break; // 出错时停止获取，使用已获取的评论
              }
            }
          }
        } catch (error) {
          console.error('获取初始评论失败:', error);
          toast.error('获取评论数据失败');
          return;
        }
      }
      
      // 清除所有加载提示
      toast.dismiss();
      
      if (allReviews.length === 0) {
        toast.error('没有评论数据可导出');
        return;
      }
      
      // 导出所有获取到的评论
      exportReviewsData(allReviews, place?.title || '未知地点');
      toast.success(`成功导出 ${allReviews.length} 条评论数据`);
      
      // 更新UI中的评论列表，如果获取了新的评论
      if (allReviews.length > reviews.length) {
        setReviews(allReviews);
        setHasLoadedReviews(true);
        setNextPageToken(null);
        setHasMoreReviews(false);
      }
    } catch (error) {
      console.error('导出评论错误:', error);
      toast.error('导出失败');
    }
  };

  if (!place) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* 返回按钮 */}
      <button
        onClick={() => router.back()}
        className="flex items-center gap-2 text-blue-600 hover:text-blue-800 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        返回搜索结果
      </button>

      {/* 地点信息 */}
      <div className="card">
        <div className="flex flex-col md:flex-row gap-6">
          {place.thumbnail && (
            <img
              src={place.thumbnail}
              alt={place.title}
              className="w-full md:w-64 h-48 object-cover rounded-lg"
            />
          )}
          
          <div className="flex-1">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">
              {place.title}
            </h1>
            
            <div className="space-y-3">
              {place.address && (
                <div className="flex items-start gap-2">
                  <MapPin className="w-5 h-5 text-gray-500 mt-0.5" />
                  <span className="text-gray-700">{place.address}</span>
                </div>
              )}
              
              {place.phone && (
                <div className="flex items-center gap-2">
                  <Phone className="w-5 h-5 text-gray-500" />
                  <span className="text-gray-700">{place.phone}</span>
                </div>
              )}
              
              {place.website && (
                <div className="flex items-center gap-2">
                  <Globe className="w-5 h-5 text-gray-500" />
                  <a
                    href={place.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:text-blue-800 transition-colors"
                  >
                    访问网站
                  </a>
                </div>
              )}
              
              {place.hours && (
                <div className="flex items-start gap-2">
                  <Clock className="w-5 h-5 text-gray-500 mt-0.5" />
                  <span className="text-gray-700">{place.hours}</span>
                </div>
              )}
            </div>
            
            <div className="flex items-center gap-4 mt-4">
              {place.rating && (
                <div className="flex items-center gap-1">
                  <Star className="w-5 h-5 text-yellow-500 fill-current" />
                  <span className="font-semibold">{place.rating}</span>
                </div>
              )}
              
              {place.reviews && (
                <span className="text-gray-600">
                  {place.reviews} 条评论
                </span>
              )}
              
              {place.type && (
                <span className="px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded-full">
                  {place.type}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* 评论区域 */}
      <div className="card">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-gray-800">
            用户评论
          </h2>
          
          <div className="flex gap-3">
            {!hasLoadedReviews && (
              <button
                onClick={() => loadReviews()}
                disabled={isLoadingReviews}
                className="btn btn-primary flex items-center gap-2"
              >
                {isLoadingReviews ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Star className="w-4 h-4" />
                )}
                {isLoadingReviews ? '加载中...' : '加载评论'}
              </button>
            )}
            
            {hasLoadedReviews && reviews.length > 0 && (
              <button
                onClick={handleExportReviews}
                className="btn btn-secondary flex items-center gap-2"
              >
                <Download className="w-4 h-4" />
                导出评论
              </button>
            )}
          </div>
        </div>
        
        {/* 添加调试信息 */}
        <div className="text-xs text-gray-400 mb-2">
          状态: {hasLoadedReviews ? '已加载' : '未加载'}, 
          评论数: {Array.isArray(reviews) ? reviews.length : 0}, 
          评论类型: {typeof reviews}, 
          是否数组: {Array.isArray(reviews) ? '是' : '否'}
        </div>
        
        {!hasLoadedReviews ? (
          <div className="text-center py-8 text-gray-500">
            <Star className="w-12 h-12 mx-auto mb-4 text-gray-300" />
            <p>点击"加载评论"按钮查看用户评论</p>
          </div>
        ) : !Array.isArray(reviews) ? (
          <div className="text-center py-8 text-gray-500">
            <Star className="w-12 h-12 mx-auto mb-4 text-gray-300" />
            <p>评论数据格式错误</p>
          </div>
        ) : reviews.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <Star className="w-12 h-12 mx-auto mb-4 text-gray-300" />
            <p>该地点暂无评论</p>
          </div>
        ) : (
          <div className="space-y-4">
            {/* 确保reviews是数组并且有内容 */}
            {reviews.map((review, index) => (
              <div key={index} className="border-b border-gray-200 pb-4 last:border-b-0">
                <div className="flex items-start gap-3">
                  {review.user?.thumbnail && (
                    <img
                      src={review.user.thumbnail}
                      alt={review.user.name}
                      className="w-10 h-10 rounded-full"
                    />
                  )}
                  
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="font-medium text-gray-900">
                        {review.user?.name || '匿名用户'}
                      </span>
                      
                      <div className="flex items-center">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={`w-4 h-4 ${
                              i < review.rating
                                ? 'text-yellow-500 fill-current'
                                : 'text-gray-300'
                            }`}
                          />
                        ))}
                      </div>
                      
                      <span className="text-sm text-gray-500">
                        {review.date}
                      </span>
                    </div>
                    
                    <p className="text-gray-700 mb-2">
                      {review.snippet}
                    </p>
                    
                    <div className="flex items-center gap-4 text-sm text-gray-500">
                      {review.likes && review.likes > 0 && (
                        <span>👍 {review.likes}</span>
                      )}
                      
                      {review.user?.reviews && (
                        <span>{review.user.reviews} 条评论</span>
                      )}
                      
                      {review.user?.photos && (
                        <span>{review.user.photos} 张照片</span>
                      )}
                    </div>
                    
                    {review.images && review.images.length > 0 && (
                      <div className="flex gap-2 mt-3">
                        {review.images.map((image, imgIndex) => (
                          <img
                            key={imgIndex}
                            src={image}
                            alt={`评论图片 ${imgIndex + 1}`}
                            className="w-20 h-20 object-cover rounded"
                          />
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
            
            {/* 加载更多按钮 */}
            {hasMoreReviews && (
              <div className="text-center pt-6">
                <button
                  onClick={() => loadReviews(true)}
                  disabled={isLoadingMore}
                  className="btn btn-outline flex items-center gap-2 mx-auto"
                >
                  {isLoadingMore ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Star className="w-4 h-4" />
                  )}
                  {isLoadingMore ? '加载中...' : '加载更多评论'}
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}