import undetected_chromedriver as uc
from selenium.webdriver.common.by import By
from selenium.webdriver.common.keys import Keys
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.common.exceptions import StaleElementReferenceException
import time


def scrape_meesho_prices(product_name):
    options = uc.ChromeOptions()
    options.add_argument("--no-sandbox")
    options.add_argument("--disable-gpu")
    options.add_argument("--window-size=1920,1080")
    options.add_argument("user-agent=Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36")

    driver = uc.Chrome(options=options)

    try:
        driver.get("https://www.meesho.com/")
        wait = WebDriverWait(driver, 15)


        search_input = wait.until(EC.presence_of_element_located((By.TAG_NAME, "input")))
        search_input.send_keys(product_name)
        search_input.send_keys(Keys.ENTER)

   
        time.sleep(5)

        prices = []
        price_elements = driver.find_elements(By.TAG_NAME, "h5")

        for i in range(len(price_elements)):
            try:
                el = price_elements[i]
                text = el.text.strip()
                if "₹" in text:
                    amount = text.replace("₹", "").replace(",", "").strip()
                    if amount.isdigit():
                        prices.append(int(amount))
            except StaleElementReferenceException:
             
                el = driver.find_elements(By.TAG_NAME, "h5")[i]
                text = el.text.strip()
                if "₹" in text:
                    amount = text.replace("₹", "").replace(",", "").strip()
                    if amount.isdigit():
                        prices.append(int(amount))

        try:
            driver.quit()
        except:
            pass

        if not prices:
            return {"error": "No prices found"}

        return {
            "min": min(prices),
            "max": max(prices),
            "avg": sum(prices) // len(prices),
            "count": len(prices),
        }

    except Exception as e:
        try:
            driver.quit()
        except:
            pass
        return {"error": str(e)}
