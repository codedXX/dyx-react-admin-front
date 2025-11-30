package com.admin;

import org.mybatis.spring.annotation.MapperScan;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

/**
 * Spring Boot 应用主入口
 */
@SpringBootApplication
@MapperScan("com.admin.mapper")
public class AdminApplication {
    
    public static void main(String[] args) {
        SpringApplication.run(AdminApplication.class, args);
        System.out.println("========================================");
        System.out.println("React Admin Backend 启动成功!");
        System.out.println("服务地址: http://localhost:8080");
        System.out.println("========================================");
    }
}
