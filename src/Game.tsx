"use client";

import * as React from "react";
import { styled } from "@mui/material/styles";
import Box from "@mui/material/Box";
import Paper from "@mui/material/Paper";
import { Stack } from "@mui/material";
import Button from "@mui/material/Button";

const black = "#EEE2DE";
const red = "#BF3131";
const blue = "#86B6F6";
const white = "#FEFAE0";

import words from "../public/words.json" assert { type: "json" };

const Item = styled(Paper)(({ theme }) => ({
	backgroundColor: theme.palette.mode === "dark" ? "#1A2027" : "#fff",
	...theme.typography.body2,
	padding: theme.spacing(1),
	textAlign: "center",
	color: theme.palette.text.secondary,
}));

let seed = 12345;

function random() : number {
  const x = seed++ / Math.PI;
  return x - Math.floor(x);
}

export const generateWords = () => {
	// delete duplicates

	const uniqueWords = Array.from(new Set(words));

	// randomly shuffle words

	// const shuffledWords = uniqueWords.sort(() => random(3) - 0.5);
  const shuffledWords = uniqueWords.sort(() => random() - 0.5);

	// pick first 25 words

	const pickedWords: string[] = shuffledWords.slice(0, 25);

	// split into 5x5

	const wordMap: string[][] = [[], [], [], [], []];

	pickedWords.map((word, i) => {
		wordMap[Math.floor(i / 5)].push(word);
	});

	return wordMap;
};

export const generateColors: () => TileColor[][] = () => {
	// generate 8 red, 8 blue, 1 black, 7 white, 1 either red or blue
	const colors: TileColor[][] = [
		[white, white, white, white, white],
		[white, white, white, white, white],
		[white, white, white, white, white],
		[white, white, white, white, white],
		[white, white, white, white, white],
	];
	let redCount = 8;
	let blueCount = 8;
	let blackCount = 1;

	while (redCount > 0) {
		const i = Math.floor(Math.random() * 5);
		const j = Math.floor(Math.random() * 5);
		if (colors[i][j] === white) {
			colors[i][j] = red;
			redCount--;
		}
	}

	while (blueCount > 0) {
		const i = Math.floor(Math.random() * 5);
		const j = Math.floor(Math.random() * 5);
		if (colors[i][j] === white) {
			colors[i][j] = blue;
			blueCount--;
		}
	}

	while (blackCount > 0) {
		const i = Math.floor(Math.random() * 5);
		const j = Math.floor(Math.random() * 5);
		if (colors[i][j] === white) {
			colors[i][j] = black;
			blackCount--;
		}
	}

	const eitherColor = Math.floor(Math.random() * 2) === 0 ? blue : red;

	while (true) {
		const i = Math.floor(Math.random() * 5);
		const j = Math.floor(Math.random() * 5);
		if (colors[i][j] === white) {
			colors[i][j] = eitherColor;
			break;
		}
	}

	return colors;
};

export const generateTileMap: () => Tile[][] = () => {
	const words = generateWords();
	const colors = generateColors();

	const tileMap: Tile[][] = words.map((row) => {
		return row.map((word) => {
			return {
				color: "white",
				word: word,
				state: "default",
			};
		});
	});

	tileMap.map((row, i) => {
		row.map((tile, j) => {
			tile.color = colors[i][j];
		});
	});

	return tileMap;
};

type TileColor = "white" | "#EEE2DE" | "#BF3131" | "#86B6F6" | "#FEFAE0";

type Tile = {
	color: TileColor;
	word: string;
	state: "default" | "opened";
};

const toColor = (tile: Tile, isSelected: boolean, isFocused: boolean) => {
	if (tile.state === "opened") {
		return tile.color;
	}
	if (isSelected) {
		return "green";
	}
	if (isFocused) {
		return "grey";
	}
	return "white";
};

const clearState = (tileMap: Tile[][]) => {
	tileMap.map((row) => {
		row.map((tile) => {
			if (tile.state !== "opened") {
				tile.state = "default";
			}
		});
	});
};

const check = (i: number, j: number, c: [number, number] | null) => {
	if (!c) {
		return false;
	}
	return c[0] === i && c[1] === j;
};

function Game() {
	const [tileMap, setTileMap] = React.useState<Tile[][]>(generateTileMap());
	const [selectedWord, setSelectedWord] = React.useState<
		[number, number] | null
	>(null);
	const [focusedWord, setFocusedWord] = React.useState<[number, number] | null>(
		null,
	);
	return (
		<div>
			<div>Ev Yapımı Codenames</div>
			<Box sx={{ flexGrow: 1, width: 800, height: 600 }}>
				<Stack spacing={2}>
					{tileMap.map((row, i) => {
						return (
							// biome-ignore lint/suspicious/noArrayIndexKey: <explanation>
							<Stack direction="row" key={i} spacing={2}>
								{row.map((word, j) => {
									const isSelected = check(i, j, selectedWord);
									const isFocused = check(i, j, focusedWord);
									return (
										<Item
											// biome-ignore lint/suspicious/noArrayIndexKey: <explanation>
											key={`${i}-${j}`}
											sx={{
												width: 200,
												backgroundColor: toColor(word, isSelected, isFocused),
											}}
											onMouseEnter={() => {
												if (isSelected || word.state === "opened") {
													return;
												}
												setFocusedWord([i, j]);
											}}
											onMouseLeave={() => {
												if (isSelected || word.state === "opened") {
													return;
												}
												setFocusedWord(null);
											}}
											onClick={() => {
												if (word.state === "opened") {
													return;
												}

												if (isSelected) {
													clearState(tileMap);
													setSelectedWord(null);
													return;
												}

												setSelectedWord([i, j]);
											}}
										>
											{tileMap[i][j].word}
										</Item>
									);
								})}
							</Stack>
						);
					})}
				</Stack>
				{selectedWord && (
					<div>
						<div>
							Seçilen Kelime: {tileMap[selectedWord[0]][selectedWord[1]].word}
						</div>
						<Button
							onClick={() => {
								tileMap[selectedWord[0]][selectedWord[1]].state = "opened";
								setTileMap([...tileMap]);
								setSelectedWord(null);
							}}
						>
							Aç
						</Button>
					</div>
				)}

				{
					<Button
						onClick={() => {
							tileMap.map((row) => {
								row.map((tile) => {
									tile.state = "opened";
								});
							});
							setTileMap([...tileMap]);
						}}
					>
						Tamamını göster
					</Button>
				}

				{
					<Button
						onClick={() => {
							tileMap.map((row) => {
								row.map((tile) => {
									tile.state = "default";
								});
							});
							setTileMap([...tileMap]);
						}}
					>
						Tamamını gizle
					</Button>
				}

				{
					<div>
						<Button
							onClick={() => {
								setTileMap(generateTileMap());
							}}
						>
							Yeni Oyun
						</Button>
					</div>
				}

				{
					<div>
						Kırmızı:
						{tileMap
							.map((row) => {
								return row.filter(
									(tile) => tile.color === red && tile.state === "opened",
								).length;
							})
							.reduce((a, b) => a + b)}
						/
						{tileMap
							.map((row) => {
								return row.filter((tile) => tile.color === red).length;
							})
							.reduce((a, b) => a + b)}
					</div>
				}

				{
					<div>
						Mavi:
						{tileMap
							.map((row) => {
								return row.filter(
									(tile) => tile.color === blue && tile.state === "opened",
								).length;
							})
							.reduce((a, b) => a + b)}
						/
						{tileMap
							.map((row) => {
								return row.filter((tile) => tile.color === blue).length;
							})
							.reduce((a, b) => a + b)}
					</div>
				}
			</Box>
		</div>
	);
}

export default Game;
