package edu.college.choisein3;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication
public class Choisein3Application {

	private static final Logger log = LoggerFactory.getLogger(Choisein3Application.class);

	public static void main(String[] args) {
		log.info("Запуск приложения ChoiseIN");
		SpringApplication.run(Choisein3Application.class, args);
		log.info("Приложение ChoiseIN успешно запущено");
	}

}
