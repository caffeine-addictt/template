package cmd

import (
	"log"
	"os"

	"github.com/caffeine-addictt/template/cmd/commands"
	"github.com/caffeine-addictt/template/cmd/options"
	"github.com/spf13/cobra"
)

// The Root command
var RootCmd = &cobra.Command{
	Use:   "template",
	Short: "Let's make starting new projects feel like a breeze again.",
	Long:  "This tool helps you to create a new project from templates.",
	PersistentPreRun: func(cmd *cobra.Command, args []string) {
		if err := options.Opts.ResolveOptions(); err != nil {
			cmd.PrintErrln(err)
			os.Exit(1)
		}
	},
}

// Setting up configuration
func init() {
	RootCmd.PersistentFlags().BoolVarP(&options.Opts.Debug, "debug", "d", false, "Debug mode [default: false]")
	RootCmd.PersistentFlags().VarP(&options.Opts.Repo, "repo", "r", "Community source repository for templates")
	RootCmd.PersistentFlags().VarP(&options.Opts.CacheDir, "cache", "C", "Where source repository will be cloned to [default: $XDG_CONFIG_HOME/template]")

	commands.InitCommands(RootCmd)
}

// The main entry point for the command line tool
func Execute() {
	if err := RootCmd.Execute(); err != nil {
		log.Fatal(err)
	}
}
