"use client";
import Link from "next/link";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";

// Definiciones para Typescript
interface System {
  type: string;
  id: string;
  attributes: {
    name: string;
    currency: string;
  };
}

// Para obtener la imagen de cada uno de los activos disponibles
interface SystemWithImage extends System {
  imageUrl: string;
}

export default function Systems(): React.ReactElement {
  const router = useRouter();
  const [userName, setUserName] = useState<string | null>(null);

  const [systems, setSystems] = useState<SystemWithImage[]>([]);

  // Paginado, 9 divisas por página
  const [currentPage, setCurrentPage] = useState<number>(1);
  const itemsPerPage = 9;
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = systems.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(systems.length / itemsPerPage);

  const paginate = (pageNumber: number) => {
    setCurrentPage(pageNumber);
  };

  // Loading mientras se esperan los datos
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Si no hay ningún usuario en el local storage el cliente nos retorna a login
    const userIsAuthenticated = localStorage.getItem("user") !== null;

    if (!userIsAuthenticated) {
      router.push("/login");
    } else {
      const storedUser = localStorage.getItem("user");
      if (storedUser) {
        const user = JSON.parse(storedUser);
        setUserName(user.name);
      }

      // Obtención de los datos de la api incluidas las imágenes coincidiendo con el system id de cada una
      const fetchData = async () => {
        try {
          const response = await fetch("https://api.saldo.com.ar/v3/systems");
          if (response.ok) {
            const data = await response.json();

            const systemsDataWithImages: SystemWithImage[] = data.data.map(
              (system: System) => ({
                ...system,
                imageUrl: `https://api.saldo.com.ar/img/sistemas2/${system.id}.big.webp`,
              })
            );

            setSystems(systemsDataWithImages);
            setIsLoading(false); // Cuando cargue los datos setLoading false y renderizar el div de los objetos
          } else {
            console.error("Error al obtener los datos");
          }
        } catch (error) {
          console.error("Error en la solicitud:", error);
        }
      };

      fetchData();
    }
  }, [router]);

  // Cierre de sesión
  const handleLogout = () => {
    localStorage.removeItem("user");
    window.location.reload();
  };

  return (
    <div className="default_page_container">
      {isLoading && (
        <div className="flex justify-center items-center h-screen">
          <p className="font-semibold">Cargando...</p>
        </div>
      )}
      {!isLoading && userName && (
        <>
          <div className="mb-4 flex justify-around items-center w-full">
            <p className="font-bold">{`Hola, ${userName}!`}</p>
            <button
              onClick={handleLogout}
              className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-700"
            >
              Cerrar Sesión
            </button>
          </div>
          <h1 className="text-2xl font-bold mb-4">
            Lista de Activos Disponibles
          </h1>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {currentItems.map((system) => (
              <div
                key={system.id}
                className="bg-white rounded-md p-4 shadow-md transition duration-300 ease-in-out transform hover:scale-105 w-80 h-36"
              >
                <Link href={`/systems/${system.id}`}>
                  <div className="flex flex-col items-center mb-2">
                    <h2 className="text-lg font-semibold">
                      {system.attributes.name}
                    </h2>
                    <Image
                      src={system.imageUrl}
                      alt={system.attributes.name}
                      width={100}
                      height={100}
                      className="img"
                    />
                  </div>
                  <p className="text-gray-500 text-center">
                    Moneda: {system.attributes.currency}
                  </p>
                </Link>
              </div>
            ))}
          </div>
          <div className="mt-4 flex justify-center">
            {Array.from({ length: totalPages }, (_, index) => (
              <button
                key={index}
                onClick={() => paginate(index + 1)}
                className={`mx-2 px-3 py-1 ${
                  currentPage === index + 1
                    ? "bg-green-saldo text-white"
                    : "bg-gray-300 text-gray-700"
                } rounded-full focus:outline-none`}
              >
                {index + 1}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
