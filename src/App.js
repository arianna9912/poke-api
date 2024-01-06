import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  Box,
  Typography,
  TextField,
  Card,
  CardMedia,
  CardContent,
  Pagination,
  FormControlLabel,
  Switch,
  Grid,
} from "@mui/material";
import { styled } from "@mui/system";


const getRandomColor = () => {
  const colors = ["#58ABF6", "#8BD674", "#FF4F4F", "#Dc82FF", "#FFA500"];
  const randomIndex = Math.floor(Math.random() * colors.length);
  return colors[randomIndex];
};
const Gallery = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [pokemonData, setPokemonData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(20);
  const [sortAscending, setSortAscending] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get("https://pokeapi.co/api/v2/pokemon?limit=1000");
        setPokemonData(response.data.results);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching data from PokeAPI:", error);
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    let filteredResults = pokemonData.filter((item) =>
      item.name.toLowerCase().startsWith(searchTerm.toLowerCase())
    );

    if (sortAscending) {
      filteredResults = filteredResults.sort((a, b) => a.name.localeCompare(b.name));
    } else {
      filteredResults = filteredResults.sort((a, b) => b.name.localeCompare(a.name));
    }

    setFilteredData(filteredResults);
    setCurrentPage(1);
  }, [searchTerm, pokemonData, sortAscending]);

  const handlePageChange = (event, pageNumber) => {
    setCurrentPage(pageNumber);
  };

  const handleSearchChange = (event) => {
    setSearchTerm(event.target.value);
  };

  const handleSortChange = (event) => {
    setSortAscending(event.target.checked);
  };

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredData.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredData.length / itemsPerPage);

  return (
    <Box
      sx={{
        margin: "20px",
      }}
    >
      <Typography variant="h4" gutterBottom>
        Pokedex
      </Typography>
      <Grid container spacing={2} alignItems="center">
        <Grid item xs={12} sm={6}>
          <TextField
            label="Buscar Pokémon"
            variant="outlined"
            value={searchTerm}
            onChange={handleSearchChange}
            fullWidth
            margin="normal"
            sx={{ width: "100%" }} // Ampliar el ancho de la barra de búsqueda
          />
        </Grid>
        <Grid item xs={12} sm={6} sx={{ textAlign: "right" }}>
          <FormControlLabel
            control={<Switch checked={sortAscending} onChange={handleSortChange} />}
            label="Ordenar A-Z"
          />
        </Grid>
      </Grid>
      {loading ? (
        <Typography variant="body1">Cargando...</Typography>
      ) : (
        <Grid container spacing={2}>
          {currentItems.map((pokemon, index) => (
            <Grid item xs={12} sm={6} md={4} lg={3} key={pokemon.name}>
              <StyledCard
                sx={{
                  border: `2px solid ${index % 2 === 0 ? getRandomColor() : getRandomColor()}`,
                }}
              >
                <CardMedia
                  component="img"
                  height="250"
                  image={`https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${pokemon.url.split(
                    "/"
                  )[6]}.png`}
                />
                <CardContent>
                  <Typography variant="h6" align="center" gutterBottom>
                    {pokemon.name}
                  </Typography>
                </CardContent>
              </StyledCard>
            </Grid>
          ))}
        </Grid>
      )}
      <Pagination
        count={totalPages}
        page={currentPage}
        onChange={handlePageChange}
        boundaryCount={2}
        showFirstButton
        showLastButton
        siblingCount={1}
        color="primary"
        sx={{ marginTop: "20px", alignSelf: "flex-end" }}
      />
    </Box>
  );
};

const StyledCard = styled(Card)`
  max-width: 220px;
  margin: 0 auto;
`;

export default Gallery;