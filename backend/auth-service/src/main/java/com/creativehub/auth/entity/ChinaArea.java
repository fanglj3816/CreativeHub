package com.creativehub.auth.entity;

import jakarta.persistence.*;

@Entity
@Table(name = "china_area")
public class ChinaArea {

    @Id
    @Column(name = "id", length = 6)
    private String id; // 6位行政区划代码

    @Column(name = "parent_id", length = 6)
    private String parentId; // 上级区域代码

    @Column(name = "name", nullable = false, length = 100)
    private String name; // 名称

    @Column(name = "level", nullable = false)
    private Integer level; // 层级: 1=省、2=市、3=区县

    // Getters and Setters
    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getParentId() {
        return parentId;
    }

    public void setParentId(String parentId) {
        this.parentId = parentId;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public Integer getLevel() {
        return level;
    }

    public void setLevel(Integer level) {
        this.level = level;
    }
}















