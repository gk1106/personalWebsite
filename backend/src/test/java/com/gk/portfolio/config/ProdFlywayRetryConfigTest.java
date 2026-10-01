package com.gk.portfolio.config;

import org.junit.jupiter.api.Test;
import org.springframework.boot.autoconfigure.flyway.FlywayProperties;
import org.springframework.boot.context.properties.bind.Binder;
import org.springframework.boot.context.properties.source.ConfigurationPropertySources;
import org.springframework.boot.env.YamlPropertySourceLoader;
import org.springframework.core.env.MutablePropertySources;
import org.springframework.core.env.PropertySource;
import org.springframework.core.io.ClassPathResource;

import java.time.Duration;
import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;

/**
 * Pure property-binding check for application-prod.yml's Flyway retry
 * settings — no Spring context, no database (real or fake), so this never
 * touches Supabase or any other Postgres instance. Exists because this
 * exact file has already shipped one silent YAML-nesting mistake before
 * (the CORS origin property) with nothing to catch it; this guards the new
 * connect-retries setting the same way.
 */
class ProdFlywayRetryConfigTest {

    @Test
    void prodProfileConfiguresFlywayConnectRetries() throws Exception {
        YamlPropertySourceLoader loader = new YamlPropertySourceLoader();
        List<PropertySource<?>> loaded = loader.load("application-prod", new ClassPathResource("application-prod.yml"));

        MutablePropertySources propertySources = new MutablePropertySources();
        loaded.forEach(propertySources::addLast);

        Binder binder = new Binder(ConfigurationPropertySources.from(propertySources));
        FlywayProperties flywayProperties = binder.bind("spring.flyway", FlywayProperties.class).get();

        assertThat(flywayProperties.getConnectRetries()).isEqualTo(5);
        assertThat(flywayProperties.getConnectRetriesInterval()).isEqualTo(Duration.ofSeconds(5));
    }
}
