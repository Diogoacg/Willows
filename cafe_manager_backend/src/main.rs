use actix_web::{get, web, App, HttpServer, Responder};
use serde::Serialize;
use utoipa::OpenApi;
use utoipa_swagger_ui::SwaggerUi;

#[derive(Serialize, OpenApi)]
struct MenuItem {
    id: i32,
    name: String,
    price: f32,
}

#[utoipa::path(
    responses(
        (status = 200, description = "List all menu items", body = Vec<MenuItem>)
    )
)]
#[get("/menu")]
async fn get_menu() -> impl Responder {
    // Lógica para buscar itens do menu do banco de dados
    let menu = vec![
        MenuItem {
            id: 1,
            name: "Café".to_string(),
            price: 2.50,
        },
        MenuItem {
            id: 2,
            name: "Croissant".to_string(),
            price: 3.00,
        },
    ];
    web::Json(menu)
}

#[actix_web::main]
async fn main() -> std::io::Result<()> {
    HttpServer::new(|| {
        App::new().service(get_menu).service(
            SwaggerUi::new("/swagger-ui/{_:.*}").url("/api-docs/openapi.json", ApiDoc::openapi()),
        )
    })
    .bind("127.0.0.1:8080")?
    .run()
    .await
}
