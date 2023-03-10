export declare module youtubePlayList {
  export interface Default {
    url: string;
    width: number;
    height: number;
  }

  export interface Medium {
    url: string;
    width: number;
    height: number;
  }

  export interface High {
    url: string;
    width: number;
    height: number;
  }

  export interface Standard {
    url: string;
    width: number;
    height: number;
  }

  export interface Maxres {
    url: string;
    width: number;
    height: number;
  }

  export interface Thumbnails {
    default: Default;
    medium: Medium;
    high: High;
    standard: Standard;
    maxres: Maxres;
  }

  export interface ResourceId {
    kind: string;
    videoId: string;
  }

  export interface Snippet {
    publishedAt: Date;
    channelId: string;
    title: string;
    description: string;
    thumbnails: Thumbnails;
    channelTitle: string;
    playlistId: string;
    position: number;
    resourceId: ResourceId;
    videoOwnerChannelTitle: string;
    videoOwnerChannelId: string;
  }

  export interface Item {
    kind: string;
    etag: string;
    id: string;
    snippet: Snippet;
  }

  export interface PageInfo {
    totalResults: number;
    resultsPerPage: number;
  }

  export interface RootObject {
    kind: string;
    etag: string;
    items: Item[];
    pageInfo: PageInfo;
  }
}
export type youtubePlayListResponse = youtubePlayList.RootObject