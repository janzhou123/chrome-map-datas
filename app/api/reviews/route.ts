import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';

const API_KEY = 'bdc98e8a682bbbab5faf67e751e5ed8e29bd1e3e4301f3845129691e5f73acac';
const BASE_URL = 'https://serpapi.com/search.json';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const data_id = searchParams.get('data_id');
  const next_page_token = searchParams.get('next_page_token');

  if (!data_id) {
    return NextResponse.json(
      { error: '缺少必要参数：data_id' },
      { status: 400 }
    );
  }

  try {
    const params: any = {
      engine: 'google_maps_reviews',
      data_id: data_id,
      api_key: API_KEY,
      hl: 'en',
      gl: 'us',
      sort_by: 'newestFirst'
    };

    // 如果有next_page_token，添加到参数中
    if (next_page_token) {
      params.next_page_token = next_page_token;
    }

    const response = await axios.get(BASE_URL, { params });

    return NextResponse.json(response.data);
  } catch (error) {
    console.error('获取评论失败:', error);
    return NextResponse.json(
      { error: '获取评论失败，请稍后重试' },
      { status: 500 }
    );
  }
}