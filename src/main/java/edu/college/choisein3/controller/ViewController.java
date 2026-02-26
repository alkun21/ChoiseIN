package edu.college.choisein3.controller;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
@Controller
public class ViewController {

    private static final Logger log = LoggerFactory.getLogger(ViewController.class);

    @GetMapping("/")
    public String showHomePage(){
        log.debug("Отображение главной страницы");
        return "index";
    }
    @GetMapping("/result")
    public String showResultPage(Model model) {
        log.debug("Отображение страницы результата");
        model.addAttribute("profileType", "Прагматичный Альтруист");
        model.addAttribute("altruism", 85);
        model.addAttribute("pragmatism", 72);
        model.addAttribute("justice", 68);
        return "result";
    }
}
