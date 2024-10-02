package cmd

import (
	"github.com/caffeine-addictt/waku/cmd/commands"
	"github.com/caffeine-addictt/waku/cmd/options"
	"github.com/caffeine-addictt/waku/cmd/utils"
	"github.com/spf13/cobra"
)

// The Root command
var RootCmd = &cobra.Command{
	Use:   "waku",
	Short: "let's make starting new projects feel like a breeze again",
	Long: utils.MultilineString(
		"Waku (waku!) 枠組み",
		"",
		"Waku helps you kickstart new projects from templates.",
		"Let's make starting new projects feel like a breeze again.",
	),
	PersistentPreRunE: func(cmd *cobra.Command, args []string) error {
		if options.GlobalOpts.Quiet {
			return log.SetLevel(log.QUIET)
		}

		if options.GlobalOpts.Verbosity > 3 || options.GlobalOpts.Verbosity < 0 {
			return fmt.Errorf("verbosity level must be between 0 and 3")
		}

		return log.SetLevel(log.WARNING - log.Level(options.GlobalOpts.Verbosity))
	},
}

// Setting up configuration
func init() {
	RootCmd.PersistentFlags().BoolVarP(&options.GlobalOpts.Quiet, "quiet", "q", false, "quiet mode")
	RootCmd.PersistentFlags().BoolVarP(&options.GlobalOpts.Accessible, "accessible", "A", false, "accessible mode")
	RootCmd.PersistentFlags().CountVarP(&options.GlobalOpts.Verbosity, "verbose", "v", "verobisty level (1: info, 2: debug, 3: trace)")

	RootCmd.MarkFlagsMutuallyExclusive("quiet", "verbose")

	commands.InitCommands(RootCmd)
}

// The main entry point for the command line tool
func Execute() {
	if err := RootCmd.Execute(); err != nil {
		os.Exit(1)
	}
}
