import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';

// 不再使用默认API_KEY，用户必须提供自己的API_KEY
const BASE_URL = 'https://serpapi.com/search.json';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const keyword = searchParams.get('keyword');
  const location = searchParams.get('location');
  const api_key = searchParams.get('api_key'); // 从请求参数中获取API_KEY

  if (!keyword || !location || !api_key) {
    return NextResponse.json(
      { error: '缺少必要参数：keyword、location 和 api_key' },
      { status: 400 }
    );
  }

  try {
    const params: any = {
      engine: 'google_maps',
      q: `${keyword} ${location}`,
      type: 'search',
      api_key: api_key, // 使用用户提供的API_KEY
      hl: 'en',
      gl: 'us'
    };

    const response = await axios.get(BASE_URL, { params });

    return NextResponse.json(response.data);
  } catch (error) {
    console.error('Google Maps 搜索失败:', error);
    return NextResponse.json(
      { error: '搜索失败，请稍后重试' },
      { status: 500 }
    );
  }
}