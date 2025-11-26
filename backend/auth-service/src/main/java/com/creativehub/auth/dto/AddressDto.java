package com.creativehub.auth.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public class AddressDto {

    @NotBlank(message = "收货人姓名不能为空")
    @Size(max = 50, message = "收货人姓名长度不能超过50个字符")
    private String receiverName;

    @NotBlank(message = "收货人电话不能为空")
    @Size(max = 20, message = "收货人电话长度不能超过20个字符")
    private String receiverPhone;

    @Size(max = 50, message = "国家长度不能超过50个字符")
    private String country;

    @Size(max = 50, message = "省份长度不能超过50个字符")
    private String province;

    @Size(max = 50, message = "城市长度不能超过50个字符")
    private String city;

    @Size(max = 50, message = "区县长度不能超过50个字符")
    private String district;

    @NotBlank(message = "详细地址不能为空")
    @Size(max = 255, message = "详细地址长度不能超过255个字符")
    private String detailAddress;

    @Size(max = 20, message = "邮编长度不能超过20个字符")
    private String postalCode;

    // Getters and Setters
    public String getReceiverName() {
        return receiverName;
    }

    public void setReceiverName(String receiverName) {
        this.receiverName = receiverName;
    }

    public String getReceiverPhone() {
        return receiverPhone;
    }

    public void setReceiverPhone(String receiverPhone) {
        this.receiverPhone = receiverPhone;
    }

    public String getCountry() {
        return country;
    }

    public void setCountry(String country) {
        this.country = country;
    }

    public String getProvince() {
        return province;
    }

    public void setProvince(String province) {
        this.province = province;
    }

    public String getCity() {
        return city;
    }

    public void setCity(String city) {
        this.city = city;
    }

    public String getDistrict() {
        return district;
    }

    public void setDistrict(String district) {
        this.district = district;
    }

    public String getDetailAddress() {
        return detailAddress;
    }

    public void setDetailAddress(String detailAddress) {
        this.detailAddress = detailAddress;
    }

    public String getPostalCode() {
        return postalCode;
    }

    public void setPostalCode(String postalCode) {
        this.postalCode = postalCode;
    }
}

