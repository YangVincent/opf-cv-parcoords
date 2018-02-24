# opf-cv-parcoords

## Paper description
The paper basically separates values per axis into bins, then plots these bins.
Rather than calculate what bins everything should be across the board, they
store a 2x2 matrix representing the space between each 2 axes, then do this for
every pair. 

In the src/ directory, we have parcoords implemented. The width can be easily changed.
All we have to do is create the binning. This should be fairly simple. 

# TODO
1. Create bins between adjacent axes
2. Calculate frequencies for each
3. For main trends, draw full on size but make more intense coloring depending on frequency count
4. For outliers, calculate if it's an isolated block, then depending on frequency. Draw single
exact lines for this.
Outliers have 2 types: isolation filter or median filter. 

Isolation filter: For a block, look at the surrounding blocks. If there aren't many, then it is an outlier.
Median filter: Compute the median of occupancies of neighbor bins. If it falls below the 
population threshold, central bin is marked as an outlier (they set this as 1-10% of max)

# Things we have to do according to the original assignment:
Required tasks:
1. Implement outlier and trend detection
2. Create a system to be able to interact with and visualize parallel coordinates including
selection. <<- what is selection? 
Optional tasks: 
1. Texture based rendering


## Questions:
Q: If the values for bins are calculated by pair, then does this mean it can change 
if the axis orders are changed?

A: It seems you cannot change axis orderings with their method


