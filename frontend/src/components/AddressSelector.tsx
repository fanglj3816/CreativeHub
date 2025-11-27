import React, { useState, useEffect, useRef } from 'react';
import { Select } from 'antd';
import { getProvinces, getCities, getDistricts } from '../api/area';
import type { ChinaArea } from '../api/area';
import './AddressSelector.css';

interface AddressSelectorProps {
  value?: {
    provinceCode?: string;
    cityCode?: string;
    districtCode?: string;
  };
  onChange?: (value: {
    provinceCode?: string;
    cityCode?: string;
    districtCode?: string;
  }) => void;
}

const AddressSelector: React.FC<AddressSelectorProps> = ({ value, onChange }) => {
  const [provinces, setProvinces] = useState<ChinaArea[]>([]);
  const [cities, setCities] = useState<ChinaArea[]>([]);
  const [districts, setDistricts] = useState<ChinaArea[]>([]);
  const [loading, setLoading] = useState(false);
  const [isFocused, setIsFocused] = useState(false);

  const [selectedProvince, setSelectedProvince] = useState<string | undefined>(value?.provinceCode);
  const [selectedCity, setSelectedCity] = useState<string | undefined>(value?.cityCode);
  const [selectedDistrict, setSelectedDistrict] = useState<string | undefined>(value?.districtCode);

  // 由于 React 18 在开发模式下会对 useEffect 进行双调用（StrictMode），
  // 需要通过 ref 确保初始化请求只触发一次，避免重复请求导致 CORS 头被写入两次。
  const hasLoadedProvinces = useRef(false);

  // 加载省份列表
  useEffect(() => {
    if (hasLoadedProvinces.current) {
      return;
    }
    hasLoadedProvinces.current = true;

    const loadProvinces = async () => {
      try {
        setLoading(true);
        const data = await getProvinces();
        setProvinces(data || []);
        if (data && data.length > 0) {
          const firstProvinceId = data[0].id;
          setSelectedProvince((prev) => prev ?? firstProvinceId);
        }
      } catch (error) {
        console.error('加载省份失败:', error);
        // 如果加载失败，设置为空数组，避免页面崩溃
        setProvinces([]);
      } finally {
        setLoading(false);
      }
    };
    loadProvinces();
  }, []);

  // 当选择省份时，加载城市列表
  useEffect(() => {
    if (selectedProvince) {
      const loadCities = async () => {
        try {
          setLoading(true);
          const data = await getCities(selectedProvince);
          const list = data || [];
          setCities(list);
          setDistricts([]);
          if (list.length > 0) {
            const firstCityId = list[0].id;
            setSelectedCity(firstCityId);
            onChange?.({
              provinceCode: selectedProvince,
              cityCode: firstCityId,
            });
          } else {
            setSelectedCity(undefined);
            setSelectedDistrict(undefined);
            onChange?.({ provinceCode: selectedProvince });
          }
        } catch (error) {
          console.error('加载城市失败:', error);
        } finally {
          setLoading(false);
        }
      };
      loadCities();
    } else {
      setCities([]);
      setDistricts([]);
    }
  }, [selectedProvince, onChange]);

  // 当选择城市时，加载区县列表
  useEffect(() => {
    if (selectedCity) {
      const loadDistricts = async () => {
        try {
          setLoading(true);
          const data = await getDistricts(selectedCity);
          const list = data || [];
          setDistricts(list);
          if (list.length > 0) {
            const firstDistrictId = list[0].id;
            setSelectedDistrict(firstDistrictId);
            onChange?.({
              provinceCode: selectedProvince,
              cityCode: selectedCity,
              districtCode: firstDistrictId,
            });
          } else {
            setSelectedDistrict(undefined);
            onChange?.({
              provinceCode: selectedProvince,
              cityCode: selectedCity,
            });
          }
        } catch (error) {
          console.error('加载区县失败:', error);
        } finally {
          setLoading(false);
        }
      };
      loadDistricts();
    } else {
      setDistricts([]);
    }
  }, [selectedCity, selectedProvince, onChange]);

  // 当选择区县时，更新值
  useEffect(() => {
    if (selectedDistrict) {
      onChange?.({
        provinceCode: selectedProvince,
        cityCode: selectedCity,
        districtCode: selectedDistrict,
      });
    }
  }, [selectedDistrict, selectedProvince, selectedCity, onChange]);

  const handleProvinceChange = (value: string) => {
    setSelectedProvince(value);
    setSelectedCity(undefined);
    setSelectedDistrict(undefined);
  };

  const handleCityChange = (value: string) => {
    setSelectedCity(value);
  };

  const handleDistrictChange = (value: string) => {
    setSelectedDistrict(value);
  };

  const hasValue = selectedProvince || selectedCity || selectedDistrict;

  return (
    <div className={`address-selector-wrapper ${isFocused || hasValue ? 'focused' : ''}`}>
      <div className="address-selector">
        <Select
          placeholder=""
          value={selectedProvince}
          onChange={handleProvinceChange}
          loading={loading}
          className="address-select"
          allowClear
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(!!hasValue)}
        >
        {provinces.map((province) => (
          <Select.Option key={province.id} value={province.id}>
            {province.name}
          </Select.Option>
        ))}
      </Select>
      <Select
        placeholder=""
        value={selectedCity}
        onChange={handleCityChange}
        loading={loading}
        className="address-select"
        disabled={!selectedProvince}
        allowClear
      >
        {cities.map((city) => (
          <Select.Option key={city.id} value={city.id}>
            {city.name}
          </Select.Option>
        ))}
      </Select>
      <Select
        placeholder=""
        value={selectedDistrict}
        onChange={handleDistrictChange}
        loading={loading}
        className="address-select"
        disabled={!selectedCity}
        allowClear
      >
        {districts.map((district) => (
          <Select.Option key={district.id} value={district.id}>
            {district.name}
          </Select.Option>
        ))}
      </Select>
      </div>
      <label className="address-label">所在地区</label>
    </div>
  );
};

export default AddressSelector;

