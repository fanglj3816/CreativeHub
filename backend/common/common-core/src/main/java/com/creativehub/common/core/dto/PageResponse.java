package com.creativehub.common.core.dto;

import java.util.Collections;
import java.util.List;

/**
 * 通用分页返回结构，便于前后端统一处理分页数据。
 *
 * @param <T> 数据类型
 */
public class PageResponse<T> {

    private List<T> items;
    private int page;
    private int pageSize;
    private long total;

    public PageResponse() {
        this(Collections.emptyList(), 1, 10, 0);
    }

    public PageResponse(List<T> items, int page, int pageSize, long total) {
        this.items = items;
        this.page = page;
        this.pageSize = pageSize;
        this.total = total;
    }

    public List<T> getItems() {
        return items;
    }

    public void setItems(List<T> items) {
        this.items = items;
    }

    public int getPage() {
        return page;
    }

    public void setPage(int page) {
        this.page = page;
    }

    public int getPageSize() {
        return pageSize;
    }

    public void setPageSize(int pageSize) {
        this.pageSize = pageSize;
    }

    public long getTotal() {
        return total;
    }

    public void setTotal(long total) {
        this.total = total;
    }
}
















