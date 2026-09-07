import React, { useState, useEffect, useMemo } from "react";
import axios from "axios";
import CssBaseline from "@mui/material/CssBaseline";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import {
  AppBar,
  Toolbar,
  Typography,
  Box,
  Container,
  Stack,
  TextField,
  InputAdornment,
  Chip,
  Grid,
  Card,
  CardContent,
  CardMedia,
  Pagination,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  CircularProgress,
  LinearProgress,
  FormControl,
  Select,
  MenuItem,
  InputLabel,
  useMediaQuery,
} from "@mui/material";
import { styled } from "@mui/system";

const THEME = createTheme({
  palette: {
    mode: "dark",
    primary: { main: "#58ABF6" },
    background: { default: "#0b1220", paper: "#151f33" },
    text: { primary: "#e2e8f0", secondary: "#94a3b8" },
  },
  shape: { borderRadius: 14 },
  typography: {
    fontFamily: `"Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif`,
  },
});

const TYPE_COLORS = {
  normal: "#A8A77A",
  fire: "#EE8130",
  water: "#6390F0",
  electric: "#F7D02C",
  grass: "#7AC74C",
  ice: "#96D9D6",
  fighting: "#C22E28",
  poison: "#A33EA1",
  ground: "#E2BF65",
  flying: "#A98FF3",
  psychic: "#F95587",
  bug: "#A6B91A",
  rock: "#B6A136",
  ghost: "#735797",
  dragon: "#6F35FC",
  dark: "#705746",
  steel: "#B7B7CE",
  fairy: "#D685AD",
};

const STAT_LABELS = {
  hp: "HP",
  attack: "Attack",
  defense: "Defense",
  "special-attack": "Sp. Atk",
  "special-defense": "Sp. Def",
  speed: "Speed",
};

const HYPHENATED_SPECIES = new Set([
  "mr-mime",
  "mime-jr",
  "mr-rime",
  "ho-oh",
  "porygon-z",
  "jangmo-o",
  "hakamo-o",
  "kommo-o",
  "tapu-koko",
  "tapu-lele",
  "tapu-bulu",
  "tapu-fini",
  "type-null",
  "wo-chien",
  "chien-pao",
  "ting-lu",
  "chi-yu",
  "great-tusk",
  "scream-tail",
  "brute-bonnet",
  "flutter-mane",
  "slither-wing",
  "sandy-shocks",
  "roaring-moon",
  "walking-wake",
  "iron-treads",
  "iron-bundle",
  "iron-hands",
  "iron-jugulis",
  "iron-moth",
  "iron-thorns",
  "iron-valiant",
  "iron-boulder",
  "iron-crown",
  "iron-leaf",
  "raging-bolt",
  "gouging-fire",
]);

const isCanonicalSpecies = (name) =>
  !name.includes("-") || HYPHENATED_SPECIES.has(name);

const typeColor = (type) => TYPE_COLORS[type] || "#88a0b8";

const spriteOf = (pokemon) =>
  pokemon?.sprites?.other?.["official-artwork"]?.front_default ||
  pokemon?.sprites?.front_default;

const capitalize = (str) =>
  str.charAt(0).toUpperCase() + str.slice(1);

const PokeballIcon = ({ size = 34 }) => (
  <svg width={size} height={size} viewBox="0 0 100 100" aria-hidden="true">
    <circle
      cx="50"
      cy="50"
      r="46"
      fill="none"
      stroke="#e2e8f0"
      strokeWidth="7"
    />
    <path d="M4 50 A46 46 0 0 1 96 50 Z" fill="#ee1515" />
    <line x1="4" y1="50" x2="96" y2="50" stroke="#e2e8f0" strokeWidth="7" />
    <circle cx="50" cy="50" r="15" fill="#e2e8f0" />
    <circle cx="50" cy="50" r="7" fill="#111827" />
  </svg>
);

async function fetchWithConcurrency(urls, concurrency, onProgress) {
  const results = new Array(urls.length);
  let cursor = 0;
  let done = 0;

  const worker = async () => {
    while (cursor < urls.length) {
      const index = cursor++;
      try {
        const { data } = await axios.get(urls[index]);
        results[index] = data;
      } catch (error) {
        results[index] = null;
      }
      done += 1;
      if (onProgress) onProgress(done);
    }
  };

  await Promise.all(
    Array.from({ length: concurrency }, () => worker())
  );

  return results.filter(Boolean);
}

const PokeCard = styled(Card)(({ theme }) => ({
  cursor: "pointer",
  background: "linear-gradient(150deg, #1c2740 0%, #141c30 100%)",
  border: "1px solid rgba(255,255,255,0.07)",
  transition: "transform 0.2s ease, box-shadow 0.2s ease, border-color 0.2s",
  "&:hover": {
    transform: "translateY(-6px)",
    boxShadow: "0 14px 32px rgba(0,0,0,0.55)",
    borderColor: "rgba(255,255,255,0.18)",
  },
}));

const SpriteBox = styled(Box)(({ glow }) => ({
  paddingTop: 12,
  display: "flex",
  justifyContent: "center",
  background: `radial-gradient(circle at 50% 65%, ${glow} 0%, rgba(0,0,0,0) 72%)`,
}));

const TypeChip = styled(Chip)(({ tcolor, selected }) => ({
  fontWeight: 700,
  color: selected ? "#0b1220" : "#ffffff",
  background: selected ? tcolor : "transparent",
  border: `2px solid ${tcolor}`,
  "&:hover": {
    background: tcolor,
    color: "#0b1220",
  },
}));

const StatBar = ({ name, value }) => {
  const color = typeColor(TYPE_OF_STAT[name] || "normal");
  const percent = Math.min(100, (value / 200) * 100);
  return (
    <Box>
      <Stack direction="row" justifyContent="space-between" mb={0.5}>
        <Typography variant="caption" fontWeight={600}>
          {STAT_LABELS[name] || name}
        </Typography>
        <Typography variant="caption" color="text.secondary">
          {value}
        </Typography>
      </Stack>
      <LinearProgress
        variant="determinate"
        value={percent}
        sx={{
          height: 8,
          borderRadius: 4,
          backgroundColor: "rgba(255,255,255,0.08)",
          "& .MuiLinearProgress-bar": {
            backgroundColor: color,
            borderRadius: 4,
          },
        }}
      />
    </Box>
  );
};

StatBar.displayName = "StatBar";

const TYPE_OF_STAT = {
  hp: "grass",
  attack: "fighting",
  defense: "steel",
  "special-attack": "fire",
  "special-defense": "water",
  speed: "electric",
};

const PokemonCard = ({ pokemon, onSelect }) => {
  const types = pokemon.types.map((t) => t.type.name);
  const mainType = types[0] || "normal";
  const artwork = spriteOf(pokemon);

  return (
    <PokeCard onClick={() => onSelect(pokemon)}>
      <SpriteBox glow={`${typeColor(mainType)}55`}>
        {artwork ? (
          <CardMedia
            component="img"
            image={artwork}
            alt={pokemon.name}
            sx={{
              width: 190,
              height: 190,
              objectFit: "contain",
              filter: "drop-shadow(0 8px 14px rgba(0,0,0,0.4))",
            }}
          />
        ) : (
          <Box width={190} height={190} />
        )}
      </SpriteBox>
      <CardContent sx={{ pt: 1 }}>
        <Stack direction="row" justifyContent="space-between" alignItems="center" mb={1}>
          <Typography variant="h6" fontWeight={700}>
            {capitalize(pokemon.name)}
          </Typography>
          <Typography variant="caption" color="text.secondary" fontWeight={600}>
            #{String(pokemon.id).padStart(3, "0")}
          </Typography>
        </Stack>
        <Stack direction="row" spacing={0.75} useFlexGap>
          {types.map((type) => (
            <Chip
              key={type}
              label={capitalize(type)}
              size="small"
              sx={{
                fontWeight: 700,
                color: "#0b1220",
                background: typeColor(type),
              }}
            />
          ))}
        </Stack>
      </CardContent>
    </PokeCard>
  );
};

PokemonCard.displayName = "PokemonCard";

const DetailModal = ({ pokemon, onClose }) => {
  const isSmall = useMediaQuery(THEME.breakpoints.down("sm"));
  if (!pokemon) return null;

  const types = pokemon.types.map((t) => t.type.name);
  const mainType = types[0] || "normal";
  const artwork = spriteOf(pokemon);

  return (
    <Dialog open onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <Typography variant="h5" fontWeight={800}>
          {capitalize(pokemon.name)}
        </Typography>
        <Typography variant="subtitle1" color="text.secondary" fontWeight={600}>
          #{String(pokemon.id).padStart(3, "0")}
        </Typography>
      </DialogTitle>
      <DialogContent dividers>
        <SpriteBox glow={`${typeColor(mainType)}44`} sx={{ mb: 1 }}>
          {artwork && (
            <img
              src={artwork}
              alt={pokemon.name}
              width={isSmall ? 180 : 220}
              style={{ filter: "drop-shadow(0 10px 20px rgba(0,0,0,0.5))" }}
            />
          )}
        </SpriteBox>

        <Stack direction="row" spacing={1} justifyContent="center" mb={2} useFlexGap>
          {types.map((type) => (
            <Chip
              key={type}
              label={capitalize(type)}
              sx={{ fontWeight: 700, color: "#0b1220", background: typeColor(type) }}
            />
          ))}
        </Stack>

        <Stack direction="row" spacing={2} justifyContent="center" mb={2}>
          <Typography variant="body2" color="text.secondary">
            Height: <b style={{ color: "#e2e8f0" }}>{(pokemon.height / 10).toFixed(1)} m</b>
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Weight: <b style={{ color: "#e2e8f0" }}>{(pokemon.weight / 10).toFixed(1)} kg</b>
          </Typography>
          {pokemon.base_experience > 0 && (
            <Typography variant="body2" color="text.secondary">
              Base Exp.: <b style={{ color: "#e2e8f0" }}>{pokemon.base_experience}</b>
            </Typography>
          )}
        </Stack>

        <Typography variant="h6" fontWeight={700} sx={{ mt: 2, mb: 1 }}>
          Statistics
        </Typography>
        <Stack spacing={1.25}>
          {pokemon.stats.map((stat) => (
            <StatBar
              key={stat.stat.name}
              name={stat.stat.name}
              value={stat.base_stat}
            />
          ))}
        </Stack>

        <Typography variant="h6" fontWeight={700} sx={{ mt: 3, mb: 1 }}>
          Abilities
        </Typography>
        <Stack direction="row" spacing={1} useFlexGap flexWrap="wrap">
          {pokemon.abilities.map((ability) => (
            <Chip
              key={ability.ability.name}
              size="small"
              label={capitalize(ability.ability.name.replace(/-/g, " "))}
              variant="outlined"
            />
          ))}
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} color="primary" variant="contained">
          Close
        </Button>
      </DialogActions>
    </Dialog>
  );
};

DetailModal.displayName = "DetailModal";

const App = () => {
  const [pokemon, setPokemon] = useState([]);
  const [loading, setLoading] = useState(true);
  const [progress, setProgress] = useState({ loaded: 0, total: 0 });

  const [searchTerm, setSearchTerm] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [sortKey, setSortKey] = useState("id");
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState(null);

  const ITEMS_PER_PAGE = 20;

  useEffect(() => {
    let cancelled = false;

    const loadPokemon = async () => {
      try {
        const { data } = await axios.get(
          "https://pokeapi.co/api/v2/pokemon?limit=10000"
        );
        const candidates = data.results
          .map((item) => item.name)
          .filter(isCanonicalSpecies);

        setProgress({ loaded: 0, total: candidates.length });

        const details = await fetchWithConcurrency(
          candidates.map((name) => `https://pokeapi.co/api/v2/pokemon/${name}`),
          12,
          (done) => {
            if (!cancelled) setProgress({ loaded: done, total: candidates.length });
          }
        );

        if (!cancelled) {
          setPokemon(details);
          setLoading(false);
        }
      } catch (error) {
        console.error("Error loading PokéAPI:", error);
        if (!cancelled) setLoading(false);
      }
    };

    loadPokemon();
    return () => {
      cancelled = true;
    };
  }, []);

  const filtered = useMemo(() => {
    const query = searchTerm.trim().toLowerCase();
    return pokemon.filter((p) => {
      if (typeFilter !== "all" && !p.types.some((t) => t.type.name === typeFilter)) {
        return false;
      }
      if (query && !p.name.toLowerCase().includes(query)) {
        return false;
      }
      return true;
    });
  }, [pokemon, searchTerm, typeFilter]);

  const sorted = useMemo(() => {
    const arr = [...filtered];
    if (sortKey === "id") {
      arr.sort((a, b) => a.id - b.id);
    } else if (sortKey === "az") {
      arr.sort((a, b) => a.name.localeCompare(b.name));
    } else {
      arr.sort((a, b) => b.name.localeCompare(a.name));
    }
    return arr;
  }, [filtered, sortKey]);

  useEffect(() => {
    setPage(1);
  }, [searchTerm, typeFilter, sortKey]);

  const totalPages = Math.max(1, Math.ceil(sorted.length / ITEMS_PER_PAGE));
  const currentPage = Math.min(page, totalPages);
  const currentItems = sorted.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  return (
    <ThemeProvider theme={THEME}>
      <CssBaseline />
      <Box
        sx={{
          minHeight: "100vh",
          background:
            "radial-gradient(1100px 500px at 15% -5%, rgba(88,171,246,0.16), transparent 60%), radial-gradient(900px 460px at 95% 0%, rgba(238,21,21,0.12), transparent 60%), #0b1220",
        }}
      >
        <AppBar
          position="sticky"
          sx={{
            background: "rgba(11,18,32,0.85)",
            backdropFilter: "blur(10px)",
            borderBottom: "1px solid rgba(255,255,255,0.07)",
          }}
        >
          <Toolbar>
            <PokeballIcon />
            <Typography variant="h5" fontWeight={800} sx={{ ml: 1.5, flexGrow: 1 }}>
              Pokédex
            </Typography>
            {!loading && pokemon.length > 0 && (
              <Typography variant="body2" color="text.secondary">
                {pokemon.length} Pokémon
              </Typography>
            )}
          </Toolbar>
        </AppBar>

        <Container maxWidth="xl" sx={{ pt: 4, pb: 6 }}>
          {loading ? (
            <Stack alignItems="center" spacing={2} sx={{ pt: 10 }}>
              <CircularProgress color="primary" />
              {progress.total > 0 && (
                <Typography color="text.secondary">
                  Loading {progress.loaded} / {progress.total} Pokémon...
                </Typography>
              )}
            </Stack>
          ) : (
            <>
              <Stack spacing={2} mb={3}>
                <TextField
                  label="Search Pokémon"
                  placeholder="e.g. pikachu, charizard, eevee..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  fullWidth
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">
                        <span role="img" aria-label="lupa">
                          🔍
                        </span>
                      </InputAdornment>
                    ),
                  }}
                />

                <Stack
                  direction="row"
                  spacing={2}
                  flexWrap="wrap"
                  alignItems="center"
                  justifyContent="space-between"
                  useFlexGap
                >
                  <Stack
                    direction="row"
                    spacing={1}
                    sx={{ overflowX: "auto", pb: 0.5, maxWidth: "100%" }}
                    useFlexGap
                  >
                    <Chip
                      label="All"
                      clickable
                      color={typeFilter === "all" ? "primary" : "default"}
                      onClick={() => setTypeFilter("all")}
                      sx={{ fontWeight: 700 }}
                    />
                    {Object.keys(TYPE_COLORS).map((type) => (
                      <TypeChip
                        key={type}
                        label={capitalize(type)}
                        tcolor={typeColor(type)}
                        selected={typeFilter === type}
                        clickable
                        onClick={() =>
                          setTypeFilter((prev) => (prev === type ? "all" : type))
                        }
                      />
                    ))}
                  </Stack>

                  <FormControl size="small" sx={{ minWidth: 170 }}>
                    <InputLabel>Sort</InputLabel>
                    <Select
                      value={sortKey}
                      onChange={(e) => setSortKey(e.target.value)}
                      label="Sort"
                    >
                      <MenuItem value="id">Number</MenuItem>
                      <MenuItem value="az">A → Z</MenuItem>
                      <MenuItem value="za">Z → A</MenuItem>
                    </Select>
                  </FormControl>
                </Stack>
              </Stack>

              {currentItems.length === 0 ? (
                <Stack alignItems="center" sx={{ py: 10 }} spacing={1}>
                  <Typography variant="h6">No Pokémon match your search</Typography>
                  <Typography variant="body2" color="text.secondary">
                    Try a different search or clear the type filter.
                  </Typography>
                </Stack>
              ) : (
                <Grid container spacing={2}>
                  {currentItems.map((p) => (
                    <Grid item xs={6} sm={4} md={3} lg={2} key={p.id}>
                      <PokemonCard pokemon={p} onSelect={setSelected} />
                    </Grid>
                  ))}
                </Grid>
              )}

              <Stack alignItems="center" sx={{ mt: 4 }}>
                <Pagination
                  count={totalPages}
                  page={currentPage}
                  onChange={(e, value) => setPage(value)}
                  boundaryCount={2}
                  siblingCount={1}
                  showFirstButton
                  showLastButton
                  color="primary"
                />
              </Stack>

              <Typography
                variant="body2"
                color="text.secondary"
                align="center"
                sx={{ mt: 5 }}
              >
                Developed by arianna9912
              </Typography>
            </>
          )}
        </Container>

        <DetailModal pokemon={selected} onClose={() => setSelected(null)} />
      </Box>
    </ThemeProvider>
  );
};

export default App;