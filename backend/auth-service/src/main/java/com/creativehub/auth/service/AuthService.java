package com.creativehub.auth.service;

import com.creativehub.auth.dto.AddressDto;
import com.creativehub.auth.dto.LoginRequest;
import com.creativehub.auth.dto.LoginResponse;
import com.creativehub.auth.dto.RegisterRequest;
import com.creativehub.auth.entity.UserAccount;
import com.creativehub.auth.entity.UserAddress;
import com.creativehub.auth.entity.UserProfile;
import com.creativehub.auth.repository.UserAccountRepository;
import com.creativehub.auth.repository.UserAddressRepository;
import com.creativehub.auth.repository.UserProfileRepository;
import com.creativehub.auth.security.JwtTokenProvider;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

@Service
public class AuthService {

    private final UserAccountRepository userAccountRepository;
    private final UserProfileRepository userProfileRepository;
    private final UserAddressRepository userAddressRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtTokenProvider jwtTokenProvider;

    public AuthService(
            UserAccountRepository userAccountRepository,
            UserProfileRepository userProfileRepository,
            UserAddressRepository userAddressRepository,
            PasswordEncoder passwordEncoder,
            JwtTokenProvider jwtTokenProvider) {
        this.userAccountRepository = userAccountRepository;
        this.userProfileRepository = userProfileRepository;
        this.userAddressRepository = userAddressRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtTokenProvider = jwtTokenProvider;
    }

    @Transactional
    public void register(RegisterRequest request) {
        // 校验邮箱是否已存在
        if (userAccountRepository.existsByEmail(request.getEmail())) {
            throw new RuntimeException("邮箱已存在");
        }

        // 创建 UserAccount
        UserAccount userAccount = new UserAccount();
        userAccount.setEmail(request.getEmail());
        userAccount.setUsername(request.getEmail()); // 默认使用邮箱作为用户名
        userAccount.setPasswordHash(passwordEncoder.encode(request.getPassword()));
        userAccount.setStatus(0); // 正常
        userAccount.setRoles("USER");
        
        userAccount = userAccountRepository.save(userAccount);

        // 创建 UserProfile
        UserProfile userProfile = new UserProfile();
        userProfile.setUserId(userAccount.getId());
        userProfile.setNickname(request.getNickname());
        userProfileRepository.save(userProfile);

        // 如果提供了地址，创建 UserAddress
        if (request.getAddress() != null) {
            AddressDto addressDto = request.getAddress();
            UserAddress userAddress = new UserAddress();
            userAddress.setUserId(userAccount.getId());
            userAddress.setReceiverName(addressDto.getReceiverName());
            userAddress.setReceiverPhone(addressDto.getReceiverPhone());
            userAddress.setCountry(addressDto.getCountry());
            userAddress.setProvince(addressDto.getProvince());
            userAddress.setCity(addressDto.getCity());
            userAddress.setDistrict(addressDto.getDistrict());
            userAddress.setDetailAddress(addressDto.getDetailAddress());
            userAddress.setPostalCode(addressDto.getPostalCode());
            userAddress.setIsDefault(1); // 设为默认地址
            userAddressRepository.save(userAddress);
        }
    }

    public LoginResponse login(LoginRequest request) {
        // 根据邮箱查询用户
        UserAccount userAccount = userAccountRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new RuntimeException("用户不存在"));

        // 判断账号状态
        if (userAccount.getStatus() != 0) {
            throw new RuntimeException("账号已被禁用");
        }

        // 校验密码
        if (!passwordEncoder.matches(request.getPassword(), userAccount.getPasswordHash())) {
            throw new RuntimeException("密码错误");
        }

        // 更新最后登录时间
        userAccount.setLastLoginAt(LocalDateTime.now());
        userAccountRepository.save(userAccount);

        // 生成 JWT
        String accessToken = jwtTokenProvider.generateToken(userAccount);

        // 返回登录响应（refreshToken 暂时为 null）
        return new LoginResponse(accessToken, null);
    }
}


